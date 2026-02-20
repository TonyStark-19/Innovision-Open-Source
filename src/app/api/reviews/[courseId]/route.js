import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// GET - Get all reviews for a course
export async function GET(request, { params }) {
  try {
    const { courseId } = params;
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "newest";

    console.log("Fetching reviews for courseId:", courseId, "sortBy:", sortBy);

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Fetch reviews - simplified query to avoid index requirements
    const reviewsSnapshot = await adminDb
      .collection("reviews")
      .where("courseId", "==", courseId)
      .get();

    let reviews = [];
    reviewsSnapshot.forEach((doc) => {
      const data = doc.data();
      // Filter out reported reviews in memory
      if (!data.reported) {
        reviews.push({
          id: doc.id,
          ...data,
        });
      }
    });

    // Apply sorting in memory (to avoid Firestore index requirements)
    if (sortBy === "newest") {
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "highest") {
      reviews.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      reviews.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "helpful") {
      reviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }

    // Get course rating stats
    const ratingDoc = await adminDb
      .collection("courseRatings")
      .doc(courseId)
      .get();

    const ratingStats = ratingDoc.exists
      ? ratingDoc.data()
      : { averageRating: 0, totalReviews: 0 };

    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating]++;
    });

    console.log("Returning reviews:", reviews.length, "stats:", ratingStats);

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        ...ratingStats,
        distribution,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error.message },
      { status: 500 }
    );
  }
}
