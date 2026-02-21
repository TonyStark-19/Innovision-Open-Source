import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get course data
    const courseRef = adminDb
      .collection("users")
      .doc(session.user.email)
      .collection("roadmaps")
      .doc(id);

    const courseSnap = await courseRef.get();

    if (!courseSnap.exists) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = courseSnap.data();

    return NextResponse.json({
      id: courseSnap.id,
      ...courseData,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get course reference
    const courseRef = adminDb
      .collection("users")
      .doc(session.user.email)
      .collection("roadmaps")
      .doc(id);

    const courseSnap = await courseRef.get();

    if (!courseSnap.exists) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Delete the course
    await courseRef.delete();

    return NextResponse.json({
      success: true,
      message: "Course deleted",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
