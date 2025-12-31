import { getServerSession } from "@/lib/auth-server";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }
    const docRef = adminDb.collection("users").doc(session.user.email);
    const userSnap = await docRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    const userData = userSnap.data();

    // If createdAt doesn't exist, add it now
    if (!userData.createdAt) {
      const createdAt = Date.now();
      await docRef.update({ createdAt });
      userData.createdAt = createdAt;
    }

    // If xptrack doesn't exist, initialize it
    if (!userData.xptrack) {
      const xptrack = Object.fromEntries(
        Array(12)
          .fill(0)
          .map((value, index) => [index, value])
      );
      await docRef.update({ xptrack });
      userData.xptrack = xptrack;
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error in getuser route:", error);
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
