import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// GET - Fetch public course (no auth required)
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Search for the course across all users
    const usersRef = adminDb.collection("users");
    const usersSnapshot = await usersRef.get();

    for (const userDoc of usersSnapshot.docs) {
      const courseRef = userDoc.ref.collection("roadmaps").doc(id);
      const courseSnap = await courseRef.get();

      if (courseSnap.exists) {
        const courseData = courseSnap.data();

        // Check if course is public
        if (!courseData.isPublic) {
          return NextResponse.json(
            { error: "This course is private" },
            { status: 403 }
          );
        }

        // Return public course data
        return NextResponse.json({
          success: true,
          course: {
            id: courseSnap.id,
            courseTitle: courseData.courseTitle,
            courseDescription: courseData.courseDescription,
            chapters: courseData.chapters || [],
            chapterCount: courseData.chapters?.length || 0,
            difficulty: courseData.difficulty,
            createdAt: courseData.createdAt,
            createdBy: userDoc.id,
            shareCount: courseData.shareCount || 0,
          },
        });
      }
    }

    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching public course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// POST - Make course public/private
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { userId, isPublic } = await request.json();

    if (!id || !userId || typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update course visibility using admin SDK
    const courseRef = adminDb.collection("users").doc(userId).collection("roadmaps").doc(id);
    
    // Check if course exists
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Update the course
    await courseRef.update({
      isPublic: isPublic,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: isPublic ? "Course is now public" : "Course is now private",
      isPublic,
    });
  } catch (error) {
    console.error("Error updating course visibility:", error);
    return NextResponse.json(
      { error: "Failed to update course: " + error.message },
      { status: 500 }
    );
  }
}
