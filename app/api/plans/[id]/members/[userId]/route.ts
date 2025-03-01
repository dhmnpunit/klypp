import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Get a specific member of a plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: planId, userId } = params;

    const planMember = await prisma.planMember.findFirst({
      where: {
        planId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        plan: true
      }
    });

    if (!planMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(planMember);
  } catch (error) {
    console.error("Error fetching plan member:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan member" },
      { status: 500 }
    );
  }
}

// Update a specific member of a plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: planId, userId } = params;
    const data = await request.json();

    // Check if the plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        members: true
      }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Check if the user is authorized (either the plan owner or the member themselves)
    if (plan.ownerId !== session.user.id && userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Update the plan member
    const updatedMember = await prisma.planMember.update({
      where: {
        id: data.id
      },
      data: {
        status: data.status
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating plan member:", error);
    return NextResponse.json(
      { error: "Failed to update plan member" },
      { status: 500 }
    );
  }
}

// Delete a specific member from a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: planId, userId } = params;

    // Check if the plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        members: {
          where: {
            status: 'ACCEPTED'
          }
        }
      }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Check if the user is authorized (either the plan owner or the member themselves)
    const isOwner = plan.ownerId === session.user.id;
    const isMember = userId === session.user.id;
    
    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Find the member
    const member = await prisma.planMember.findFirst({
      where: {
        planId,
        userId
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // If the user is leaving the plan (not being removed by the owner),
    // store it as a canceled plan for analytics
    if (isMember) {
      // Count accepted members
      const acceptedMemberCount = plan.members.length;

      // Store as a canceled plan
      await prisma.canceledPlan.create({
        data: {
          name: plan.name,
          cost: plan.cost,
          renewalFrequency: plan.renewalFrequency,
          userId: userId,
          memberCount: acceptedMemberCount,
          wasOwner: false,
          originalPlanId: planId
        }
      });
    }

    // Delete the plan member
    await prisma.planMember.delete({
      where: {
        id: member.id
      }
    });

    // Update the plan's current members count if the member was accepted
    if (member.status === 'ACCEPTED') {
      await prisma.plan.update({
        where: { id: planId },
        data: {
          currentMembers: {
            decrement: 1
          }
        }
      });
    }

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing plan member:", error);
    return NextResponse.json(
      { error: "Failed to remove plan member" },
      { status: 500 }
    );
  }
} 