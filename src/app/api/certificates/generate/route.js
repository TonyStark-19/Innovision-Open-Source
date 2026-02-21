import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { nanoid } from "nanoid";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, courseId } = body;

    // Guard: both fields required
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId and courseId" },
        { status: 400 }
      );
    }

    // Get course details — userId is user.email (project primary key)
    const courseRef = doc(db, "users", userId, "roadmaps", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = courseSnap.data();

    // Check all chapters are completed
    const chapters = courseData.chapters || [];
    const allChaptersCompleted =
      chapters.length > 0 && chapters.every((ch) => ch.completed);

    if (!allChaptersCompleted) {
      return NextResponse.json(
        { success: false, error: "Course not completed yet" },
        { status: 400 }
      );
    }

    // Return existing certificate if already generated
    const certificatesRef = collection(db, "users", userId, "certificates");
    const existingCerts = await getDocs(
      query(certificatesRef, where("courseId", "==", courseId))
    );

    if (!existingCerts.empty) {
      const existingDoc = existingCerts.docs[0];
      const existingData = existingDoc.data();

      // Safely serialize issuedAt — Firestore Timestamp is not JSON-safe
      let issuedAt = null;
      if (existingData.issuedAt) {
        try {
          issuedAt =
            typeof existingData.issuedAt.toDate === "function"
              ? existingData.issuedAt.toDate().toISOString()
              : String(existingData.issuedAt);
        } catch {
          issuedAt = new Date().toISOString();
        }
      }

      return NextResponse.json({
        success: true,
        certificate: {
          id: existingDoc.id,
          certificateId: existingData.certificateId,
          userId: existingData.userId,
          courseId: existingData.courseId,
          courseTitle: existingData.courseTitle,
          userName: existingData.userName,
          completionDate: existingData.completionDate,
          chapterCount: existingData.chapterCount,
          issuedAt,
          verified: existingData.verified,
        },
      });
    }

    // Generate unique certificate ID
    const certificateId = nanoid(12);

    // Get user display name — guard against missing user doc
    let userName = "Student";
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      userName = userData.displayName || userData.name || userData.email || "Student";
    }

    // Resolve course title with fallback
    const courseTitle =
      courseData.courseTitle || courseData.title || "Untitled Course";

    const chapterCount = chapters.length;

    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const issuedAtISO = new Date().toISOString();

    // Save to Firestore with serverTimestamp (not JSON-serialized)
    const certDocData = {
      certificateId,
      userId,
      courseId,
      courseTitle,
      userName,
      completionDate,
      chapterCount,
      issuedAt: serverTimestamp(),
      verified: true,
    };

    const certRef = await addDoc(certificatesRef, certDocData);

    // Return plain JSON-safe response (no serverTimestamp)
    return NextResponse.json({
      success: true,
      certificate: {
        id: certRef.id,
        certificateId,
        userId,
        courseId,
        courseTitle,
        userName,
        completionDate,
        chapterCount,
        issuedAt: issuedAtISO,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
