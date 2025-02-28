import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { db, messaging } from '@/lib/firebase/admin';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // First, await the params
    const params = await Promise.resolve(context.params);
    const memberId = params.id;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { action } = await request.json();
    if (!action || !["ACCEPT", "DECLINE"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the plan member and check if it exists
    const member = await prisma.planMember.findUnique({
      where: { id: memberId },
      include: { plan: true }
    });

    if (!member) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if the user is the invitee
    if (member.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Check if the invitation is still pending
    if (member.status !== "PENDING") {
      return NextResponse.json({ error: "Invitation already processed" }, { status: 400 });
    }

    // Update the member status
    const updatedMember = await prisma.planMember.update({
      where: { id: memberId },
      data: { status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" },
      include: { plan: true }
    });

    // Update the notification in Firestore
    const notificationsRef = db.collection('notifications');
    const notificationsSnapshot = await notificationsRef
      .where('metadata.memberId', '==', memberId)
      .where('type', '==', 'PLAN_INVITATION')
      .get();

    if (!notificationsSnapshot.empty) {
      const notificationDoc = notificationsSnapshot.docs[0];
      await notificationDoc.ref.update({
        'metadata.status': action === "ACCEPT" ? "ACCEPTED" : "DECLINED"
      });
    }

    // Create a notification for the plan owner
    await db.collection('notifications').add({
      userId: member.plan.ownerId,
      title: `Plan Invitation ${action === "ACCEPT" ? "Accepted" : "Declined"}`,
      message: `${session.user.name || 'Someone'} has ${action === "ACCEPT" ? "accepted" : "declined"} the invitation to join ${member.plan.name}`,
      type: "PLAN_INVITATION_RESPONSE",
      metadata: {
        planId: member.planId,
        planName: member.plan.name,
        memberId: member.id,
        status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED"
      },
      isRead: false,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json(
      { error: "Failed to process invitation" },
      { status: 500 }
    );
  }
}

// Get a specific invitation
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const invitationId = params.id;
    
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

    const invitation = await prisma.planMember.findUnique({
      where: { id: invitationId },
      include: {
        plan: {
          include: {
            owner: {
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

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if the user is either the plan owner or the invited user
    if (invitation.userId !== user.id && invitation.plan.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
} 