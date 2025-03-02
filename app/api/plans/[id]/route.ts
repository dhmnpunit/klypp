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
    console.log(`GET request for plan with ID: ${params.id}`);
    
    const session = await getServerSession(authOptions);
    console.log(`Session:`, session?.user?.email);
    
    if (!session?.user) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use the resolved params.id
    const resolvedParams = await Promise.resolve(params);
    console.log(`Looking up plan with ID: ${resolvedParams.id}`);
    
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
      console.log(`Plan not found with ID: ${resolvedParams.id}`);
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    console.log(`Successfully found plan: ${plan.name}`);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch plan" },
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
    console.log(`PUT request for plan with ID: ${params.id}`);
    
    const session = await getServerSession(authOptions);
    console.log(`Session:`, session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the plan exists and belongs to the user
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: { owner: true }
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (existingPlan.ownerId !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to update this plan' }, { status: 403 });
    }

    const data = await request.json();
    const { name, cost, renewalFrequency, maxMembers, startDate, logoUrl } = data;

    const planStartDate = new Date(startDate);
    const nextRenewalDate = calculateNextRenewalDate(planStartDate, renewalFrequency);

    // If logoUrl is provided, use it directly
    // If not provided and name has changed, fetch a new logo
    let updatedLogoUrl = logoUrl;
    
    if (logoUrl === undefined && name !== existingPlan.name) {
      try {
        const origin = request.headers.get('origin') || '';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const logoResponse = await fetch(`${origin}/api/logo-search?name=${encodeURIComponent(name)}`, {
          headers: {
            'Cookie': request.headers.get('cookie') || ''
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (logoResponse.ok) {
          const logoData = await logoResponse.json();
          updatedLogoUrl = logoData.logoUrl;
          console.log('Successfully fetched new logo URL:', updatedLogoUrl);
        }
      } catch (error) {
        console.error('Error fetching logo:', error instanceof Error ? error.message : String(error));
        // Continue with existing logo if there's an error
        updatedLogoUrl = existingPlan.logoUrl;
      }
    }

    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name,
        cost: parseFloat(cost.toString()),
        renewalFrequency,
        maxMembers: parseInt(maxMembers.toString()),
        startDate: planStartDate,
        nextRenewalDate,
        logoUrl: updatedLogoUrl
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Failed to update plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update plan' },
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

    if (plan.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Count accepted members
    const acceptedMemberCount = plan.members.length;

    // Delete plan and its members in a transaction
    await prisma.$transaction([
      // Store the canceled plan for analytics
      prisma.canceledPlan.create({
        data: {
          name: plan.name,
          cost: plan.cost,
          renewalFrequency: plan.renewalFrequency,
          userId: session.user.id,
          memberCount: acceptedMemberCount,
          wasOwner: true,
          originalPlanId: planId
        }
      }),
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