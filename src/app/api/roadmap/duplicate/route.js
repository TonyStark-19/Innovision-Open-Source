import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roadmapId } = await req.json();

    if (!roadmapId) {
      return NextResponse.json({ message: "Roadmap ID is required" }, { status: 400 });
    }

    const userEmail = session.user.email;
    const sourceRoadmapRef = adminDb
      .collection("users")
      .doc(userEmail)
      .collection("roadmaps")
      .doc(roadmapId);

    // Get the source roadmap
    const sourceRoadmapSnap = await sourceRoadmapRef.get();

    if (!sourceRoadmapSnap.exists) {
      return NextResponse.json({ message: "Roadmap not found" }, { status: 404 });
    }

    const sourceRoadmapData = sourceRoadmapSnap.data();

    // Create new roadmap with "(Copy)" appended to title
    const newRoadmapRef = adminDb
      .collection("users")
      .doc(userEmail)
      .collection("roadmaps")
      .doc();

    const newRoadmapData = {
      ...sourceRoadmapData,
      courseTitle: `${sourceRoadmapData.courseTitle} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Reset progress for the copy
      completed: false,
      completedChapters: [],
    };

    await newRoadmapRef.set(newRoadmapData);

    // Get all chapters from source roadmap
    const sourceChaptersRef = sourceRoadmapRef.collection("chapters");
    const sourceChaptersSnap = await sourceChaptersRef.get();

    // Copy each chapter
    const chapterCopyPromises = sourceChaptersSnap.docs.map(async (chapterDoc) => {
      const chapterData = chapterDoc.data();
      const newChapterRef = newRoadmapRef.collection("chapters").doc(chapterDoc.id);

      // Copy chapter data
      await newChapterRef.set({
        ...chapterData,
        completed: false, // Reset completion status
      });

      // Get and copy tasks for this chapter
      const sourceTasksRef = chapterDoc.ref.collection("tasks").doc("task");
      const sourceTasksSnap = await sourceTasksRef.get();

      if (sourceTasksSnap.exists) {
        const newTasksRef = newChapterRef.collection("tasks").doc("task");
        await newTasksRef.set(sourceTasksSnap.data());
      }
    });

    await Promise.all(chapterCopyPromises);

    return NextResponse.json({
      message: "Course duplicated successfully",
      newRoadmapId: newRoadmapRef.id,
      courseTitle: newRoadmapData.courseTitle,
    });
  } catch (error) {
    console.error("Error duplicating roadmap:", error);
    return NextResponse.json(
      { message: "Failed to duplicate course", error: error.message },
      { status: 500 }
    );
  }
}
