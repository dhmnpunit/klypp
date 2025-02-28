import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

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
      where: { id: params.id },
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

    if (action === 'ACCEPT') {
      // Check if the plan has reached its member limit
      if (invitation.plan.currentMembers >= invitation.plan.maxMembers) {
        return NextResponse.json(
          { error: 'Plan has reached maximum member limit' },
          { status: 400 }
        );
      }

      // Update the invitation status and increment currentMembers
      const updatedInvitation = await prisma.$transaction([
        prisma.planMember.update({
          where: { id: params.id },
          data: { status: 'ACTIVE' }
        }),
        prisma.plan.update({
          where: { id: invitation.planId },
          data: {
            currentMembers: {
              increment: 1
            }
          }
        })
      ]);

      return NextResponse.json(updatedInvitation[0]);
    } else {
      // Decline the invitation
      const updatedInvitation = await prisma.planMember.update({
        where: { id: params.id },
        data: { status: 'DECLINED' }
      });

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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
      where: { id: params.id },
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