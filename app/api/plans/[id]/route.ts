import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use the resolved params.id
    const resolvedParams = await Promise.resolve(params);
    const plan = await prisma.plan.findUnique({
      where: { id: resolvedParams.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

// Update a specific plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: params.id }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const data = await request.json();
    const { name, cost, renewalFrequency, maxMembers, startDate } = data;

    const planStartDate = new Date(startDate);
    const nextRenewalDate = calculateNextRenewalDate(planStartDate, renewalFrequency);

    // Update the plan
    const updatedPlan = await prisma.plan.update({
      where: { id: params.id },
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
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

// Delete a specific plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Await params properly
    const resolvedParams = await Promise.resolve(params);
    const planId = resolvedParams.id;

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Delete plan and its members in a transaction
    await prisma.$transaction([
      // First delete all plan members
      prisma.planMember.deleteMany({
        where: { planId: planId }
      }),
      // Then delete all notifications related to this plan
      prisma.notification.deleteMany({
        where: {
          metadata: {
            path: ['planId'],
            equals: planId
          }
        }
      }),
      // Finally delete the plan itself
      prisma.plan.delete({
        where: { id: planId }
      })
    ]);

    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}

// Patch a specific plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: params.id }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const data = await request.json();
    const updatedPlan = await prisma.plan.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
} 