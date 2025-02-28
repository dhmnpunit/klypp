import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // For now, we'll return mock notifications
    // In the future, this will be replaced with actual database queries
    const notifications = [
      {
        id: "1",
        title: "Netflix Subscription Renewal",
        message: "Your Netflix subscription will renew in 3 days",
        type: "renewal",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        title: "New Member Request",
        message: "John Doe wants to join your Netflix plan",
        type: "member",
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        title: "Payment Successful",
        message: "Payment for Spotify subscription was successful",
        type: "payment",
        isRead: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];

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

    // For now, we'll just return success
    // In the future, this will update the notification status in the database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 