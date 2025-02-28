import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/firebase/admin";
import type { DocumentData } from "firebase-admin/firestore";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all notifications for the user from Firestore
    const notificationsRef = db.collection('notifications');
    const q = notificationsRef
      .where('userId', '==', session.user.id)
      .orderBy('createdAt', 'desc');

    const snapshot = await q.get();
    const notifications = snapshot.docs.map((doc: DocumentData) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    }));

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { notificationId } = await request.json();

    if (!notificationId) {
      return new NextResponse("Notification ID is required", { status: 400 });
    }

    // Update the notification status in Firestore
    const notificationRef = db.doc(`notifications/${notificationId}`);
    await notificationRef.update({
      isRead: true
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 