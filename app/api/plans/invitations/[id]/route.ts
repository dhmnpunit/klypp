import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { pusherServer } from '@/lib/pusher';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // First, await the params
    const params = await Promise.resolve(context.params);
    const invitationId = params.id;
    
    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the action from the request body
    const body = await request.json();
    const { action } = body;

    if (!action || !['ACCEPT', 'DECLINE'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be ACCEPT or DECLINE' },
        { status: 400 }
      );
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the invitation
    const invitation = await prisma.planMember.findUnique({
      where: { id: invitationId },
      include: {
        plan: true
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if the invitation belongs to the current user
    if (invitation.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if the invitation is still pending
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invitation has already been processed' },
        { status: 400 }
      );
    }

    // Find the original notification
    const notification = await prisma.notification.findFirst({
      where: {
        userId: currentUser.id,
        type: "INVITE",
        metadata: {
          path: ["memberId"],
          equals: invitationId
        }
      }
    });

    if (action === 'ACCEPT') {
      // Check if the plan has reached its member limit
      if (invitation.plan.currentMembers >= invitation.plan.maxMembers) {
        return NextResponse.json(
          { error: 'Plan has reached maximum member limit' },
          { status: 400 }
        );
      }

      // Update the invitation status, increment currentMembers, and update notification
      const [updatedInvitation, _, updatedNotification] = await prisma.$transaction([
        prisma.planMember.update({
          where: { id: invitationId },
          data: { status: 'ACTIVE' }
        }),
        prisma.plan.update({
          where: { id: invitation.planId },
          data: {
            currentMembers: {
              increment: 1
            }
          }
        }),
        ...(notification ? [
          prisma.notification.update({
            where: { id: notification.id },
            data: {
              message: `You have accepted the invitation to join ${invitation.plan.name}`,
              isRead: true,
              metadata: {
                ...notification.metadata,
                status: 'ACTIVE'
              }
            }
          })
        ] : [])
      ]);

      // Trigger Pusher event for notification update
      if (updatedNotification) {
        await pusherServer.trigger(`user-${currentUser.id}`, 'notification-updated', {
          notification: updatedNotification
        });
      }

      return NextResponse.json(updatedInvitation);
    } else {
      // Decline the invitation and update notification
      const [updatedInvitation, updatedNotification] = await prisma.$transaction([
        prisma.planMember.update({
          where: { id: invitationId },
          data: { status: 'DECLINED' }
        }),
        ...(notification ? [
          prisma.notification.update({
            where: { id: notification.id },
            data: {
              message: `You have declined the invitation to join ${invitation.plan.name}`,
              isRead: true,
              metadata: {
                ...notification.metadata,
                status: 'DECLINED'
              }
            }
          })
        ] : [])
      ]);

      // Trigger Pusher event for notification update
      if (updatedNotification) {
        await pusherServer.trigger(`user-${currentUser.id}`, 'notification-updated', {
          notification: updatedNotification
        });
      }

      return NextResponse.json(updatedInvitation);
    }
  } catch (error) {
    console.error('Error processing invitation:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
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
    const invitationId = await Promise.resolve(context.params.id);
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