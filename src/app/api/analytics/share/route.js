import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    const { courseId, userId, platform } = await request.json();

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Increment share count
    const courseRef = adminDb.collection("users").doc(userId).collection("roadmaps").doc(courseId);
    const courseSnap = await courseRef.get();

    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const currentShareCount = courseSnap.data().shareCount || 0;

    await courseRef.update({
      shareCount: currentShareCount + 1,
      lastSharedAt: new Date().toISOString(),
      lastSharedPlatform: platform || "link",
    });

    // Optionally log to analytics collection
    await adminDb.collection("analytics").add({
      type: "course_share",
      courseId,
      userId,
      platform: platform || "link",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      shareCount: currentShareCount + 1,
    });
  } catch (error) {
    console.error("Error tracking share:", error);
    return NextResponse.json(
      { error: "Failed to track share" },
      { status: 500 }
    );
  }
}
