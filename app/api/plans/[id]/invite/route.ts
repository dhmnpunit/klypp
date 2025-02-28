import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { db, messaging } from "@/lib/firebase/admin";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // First, await the params
    const params = await Promise.resolve(context.params);
    const planId = params.id;
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if plan exists and user is the owner
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { members: true, owner: true }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Check if maximum members limit is reached
    if (plan.members.length >= plan.maxMembers) {
      return NextResponse.json({ error: "Maximum members limit reached" }, { status: 400 });
    }

    // Find the invited user
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitedUser) {
      return NextResponse.json({ error: "Invited user not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.planMember.findFirst({
      where: {
        planId: planId,
        userId: invitedUser.id
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    // Create new plan member with PENDING status
    const newMember = await prisma.planMember.create({
      data: {
        userId: invitedUser.id,
        planId: planId,
        status: "PENDING"
      }
    });

    // Create notification in Firestore
    const notificationRef = await db.collection('notifications').add({
      userId: invitedUser.id,
      title: "New Plan Invitation",
      message: `${session.user.name || 'Someone'} has invited you to join their ${plan.name} plan`,
      type: "PLAN_INVITATION",
      metadata: {
        planId: plan.id,
        planName: plan.name,
        inviterId: session.user.id,
        inviterName: session.user.name,
        memberId: newMember.id
      },
      isRead: false,
      createdAt: new Date()
    });

    // Send FCM notification if device tokens exist
    const userDevicesSnapshot = await db
      .collection('user_devices')
      .where('userId', '==', invitedUser.id)
      .get();

    if (!userDevicesSnapshot.empty) {
      const tokens = userDevicesSnapshot.docs.map(doc => doc.data().token);
      
      const message = {
        notification: {
          title: 'New Plan Invitation',
          body: `${session.user.name || 'Someone'} has invited you to join their ${plan.name} plan`
        },
        data: {
          notificationId: notificationRef.id,
          planId: plan.id,
          type: 'PLAN_INVITATION'
        }
      };

      // Send to all user devices
      await Promise.all(tokens.map(token => 
        messaging.send({ ...message, token })
          .catch(error => console.error('Error sending FCM message:', error))
      ));
    }

    return NextResponse.json({ success: true, memberId: newMember.id });
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json(
      { error: "Failed to invite member" },
      { status: 500 }
    );
  }
}

// Get all invitations for a plan
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // First, await the params
    const params = await Promise.resolve(context.params);
    const planId = params.id;
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if the user is the plan owner
    if (plan.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(plan.members);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
} 