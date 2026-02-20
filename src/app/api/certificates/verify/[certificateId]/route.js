import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(request, { params }) {
  try {
    const { certificateId } = params;

    if (!certificateId) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    // Search for certificate across all users
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      const certificatesRef = collection(db, "users", userDoc.id, "certificates");
      const q = query(certificatesRef, where("certificateId", "==", certificateId));
      const certSnapshot = await getDocs(q);

      if (!certSnapshot.empty) {
        const certData = certSnapshot.docs[0].data();
        return NextResponse.json({
          success: true,
          valid: true,
          certificate: {
            userName: certData.userName,
            courseTitle: certData.courseTitle,
            completionDate: certData.completionDate,
            chapterCount: certData.chapterCount,
            verified: certData.verified,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      valid: false,
      message: "Certificate not found",
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { error: "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
