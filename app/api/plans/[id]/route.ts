import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

// Helper function to calculate next renewal date
function calculateNextRenewalDate(startDate: Date, renewalFrequency: string): Date {
  const date = new Date(startDate);
  
  switch (renewalFrequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1); // Default to monthly
  }
  
  return date;
}

// Get a specific plan
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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
      where: {
        id: resolvedParams.id,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if the user owns the plan
    if (plan.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// Update a specific plan
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    // Check if the plan exists and belongs to the user
    const existingPlan = await prisma.plan.findUnique({
      where: {
        id: resolvedParams.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (existingPlan.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { name, cost, renewalFrequency, maxMembers, startDate } = data;

    const planStartDate = new Date(startDate);
    const nextRenewalDate = calculateNextRenewalDate(planStartDate, renewalFrequency);

    // Update the plan
    const updatedPlan = await prisma.plan.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        name,
        cost: parseFloat(cost.toString()),
        renewalFrequency,
        maxMembers: parseInt(maxMembers.toString()),
        startDate: planStartDate,
        nextRenewalDate,
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// Delete a specific plan
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    // Check if the plan exists and belongs to the user
    const existingPlan = await prisma.plan.findUnique({
      where: {
        id: resolvedParams.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (existingPlan.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the plan
    await prisma.plan.delete({
      where: {
        id: resolvedParams.id,
      },
    });

    return NextResponse.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
} 