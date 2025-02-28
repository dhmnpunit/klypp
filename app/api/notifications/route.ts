import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

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

    // Update the notification status
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id
      },
      data: {
        isRead: true
      }
    });

    // Trigger real-time update
    await pusherServer.trigger(`user-${session.user.id}`, 'notification-updated', {
      notification
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper function to trigger notification updates
export async function triggerNotificationUpdate(userId: string, notification: any) {
  try {
    await pusherServer.trigger(`user-${userId}`, 'notification-new', {
      notification
    });
  } catch (error) {
    console.error("Error triggering notification update:", error);
    // Don't throw the error as this is a background operation
  }
} 