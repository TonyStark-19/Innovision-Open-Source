import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

export async function POST(request) {
  try {
    const { userId, courseId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get course details
    const courseRef = doc(db, "users", userId, "roadmaps", courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = courseSnap.data();
    
    // Check if all chapters are completed
    const allChaptersCompleted = courseData.chapters?.every(ch => ch.completed) || false;
    
    if (!allChaptersCompleted) {
      return NextResponse.json(
        { error: "Course not completed yet" },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const certificatesRef = collection(db, "users", userId, "certificates");
    const existingCerts = await getDocs(
      query(certificatesRef, where("courseId", "==", courseId))
    );

    if (!existingCerts.empty) {
      // Return existing certificate
      const existingCert = existingCerts.docs[0];
      return NextResponse.json({
        success: true,
        certificate: {
          id: existingCert.id,
          ...existingCert.data(),
        },
      });
    }

    // Generate unique certificate ID
    const certificateId = nanoid(12);

    // Get user details
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    // Create certificate data
    const certificateData = {
      certificateId,
      userId,
      courseId,
      courseTitle: courseData.courseTitle,
      userName: userData?.displayName || userData?.email || "Student",
      completionDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      chapterCount: courseData.chapters?.length || 0,
      issuedAt: serverTimestamp(),
      verified: true,
    };

    // Save certificate to Firestore
    const certRef = await addDoc(certificatesRef, certificateData);

    return NextResponse.json({
      success: true,
      certificate: {
        id: certRef.id,
        ...certificateData,
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
