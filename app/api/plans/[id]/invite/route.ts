import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email } = await request.json();
    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Check if plan exists and user is the owner
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: { members: true }
    });

    if (!plan) {
      return new NextResponse("Plan not found", { status: 404 });
    }

    if (plan.ownerId !== session.user.id) {
      return new NextResponse("Only plan owner can invite members", { status: 403 });
    }

    // Check if member count would exceed max members
    if (plan.members.length >= plan.maxMembers) {
      return new NextResponse("Maximum member limit reached", { status: 400 });
    }

    // Check if user is already a member
    const existingMember = await prisma.planMember.findFirst({
      where: {
        planId: params.id,
        email: email
      }
    });

    if (existingMember) {
      return new NextResponse("User is already a member", { status: 400 });
    }

    // Create invitation
    const invitation = await prisma.planMember.create({
      data: {
        email: email,
        planId: params.id,
        status: "PENDING"
      }
    });

    // TODO: Send invitation email to the user

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error inviting member:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Get all invitations for a plan
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

    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
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