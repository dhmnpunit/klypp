import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the member ID from params
    const memberId = params.id;

    // Find the member and include the plan
    const member = await prisma.planMember.findUnique({
      where: { id: memberId },
      include: {
        plan: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if the current user is the plan owner
    if (member.plan.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Remove member and update plan in a transaction
    const result = await prisma.$transaction([
      // Delete the member
      prisma.planMember.delete({
        where: { id: memberId }
      }),
      // Decrement the current members count
      prisma.plan.update({
        where: { id: member.planId },
        data: {
          currentMembers: {
            decrement: 1
          }
        }
      }),
      // Create a notification for the removed member
      prisma.notification.create({
        data: {
          userId: member.userId,
          title: "Removed from Plan",
          message: `You have been removed from the ${member.plan.name} plan`,
          type: "PLAN_UPDATE",
          metadata: {
            planId: member.planId,
            planName: member.plan.name,
            action: "REMOVED"
          }
        }
      })
    ]);

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
} 