import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    console.log('Analytics API Session:', session);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      console.log('No authenticated session found in analytics API');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the user directly by ID from the session
    const userId = session.user.id;
    console.log('Fetching analytics for user ID:', userId);

    // Get the current month
    const now = new Date();
    
    try {
      // First, check if the user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });
      
      if (!userExists) {
        console.error(`User with ID ${userId} not found in database`);
        return NextResponse.json({ 
          error: "User not found in database",
          currentMonthSpending: 0,
          planCount: 0,
          totalSavings: 0,
          canceledPlanCount: 0,
          sharedPlanSavings: 0
        });
      }
      
      console.log('User exists, proceeding with analytics queries');
      
      // Get all plans where the user is an owner or member
      const plans = await prisma.plan.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId: userId,
                  status: 'ACCEPTED'
                }
              }
            }
          ]
        },
        include: {
          members: {
            where: {
              status: 'ACCEPTED'
            }
          }
        }
      });

      console.log(`Found ${plans.length} plans for analytics`);

      // Calculate total monthly spending and savings from shared plans
      let totalMonthlySpending = 0;
      let planCount = plans.length;
      let sharedPlanSavings = 0;

      plans.forEach(plan => {
        try {
          // Calculate user's share of the plan
          const acceptedMembersCount = plan.members.length;
          const totalMembers = acceptedMembersCount + 1; // +1 for the owner
          const userShare = plan.cost / totalMembers;
          
          totalMonthlySpending += userShare;
          
          // Calculate savings from shared plans
          // If there are multiple members (shared plan), calculate how much is saved
          if (totalMembers > 1) {
            // The savings is the difference between the full cost and the user's share
            const savedAmount = plan.cost - userShare;
            sharedPlanSavings += savedAmount;
            console.log(`Plan ${plan.id}: Full cost: ${plan.cost}, User share: ${userShare}, Saved: ${savedAmount}`);
          }
        } catch (calcError) {
          console.error('Error calculating share for plan:', plan.id, calcError);
        }
      });

      // Get canceled plans for savings calculation
      let canceledPlans = [];
      try {
        canceledPlans = await prisma.canceledPlan.findMany({
          where: {
            userId: userId,
            canceledAt: {
              gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) // Last 3 months
            }
          }
        });
        console.log(`Found ${canceledPlans.length} canceled plans for analytics`);
      } catch (canceledError) {
        console.error('Error fetching canceled plans:', canceledError);
        // Continue with empty canceled plans
      }

      // Calculate savings from canceled plans
      let canceledPlanSavings = 0;
      
      // For each canceled plan, calculate the user's share
      for (const plan of canceledPlans) {
        try {
          // Try to find if there were any members for this plan before it was canceled
          // We'll need to query the PlanMember table for historical data
          const planMembers = await prisma.planMember.findMany({
            where: {
              planId: plan.originalPlanId || '',
              status: 'ACCEPTED'
            },
            select: {
              id: true
            }
          }).catch(() => []);
          
          // Calculate the user's share based on the plan's membership
          // If we can't find member data, we'll use the memberCount from the canceledPlan
          let userShare = plan.cost;
          
          if (planMembers && planMembers.length > 0) {
            // If we found members, calculate the share
            const totalMembers = planMembers.length + 1; // +1 for the owner
            userShare = plan.cost / totalMembers;
          } else if (plan.memberCount > 0) {
            // Use the stored memberCount
            const totalMembers = plan.memberCount + 1; // +1 for the owner
            userShare = plan.cost / totalMembers;
          } else if (plan.renewalFrequency === 'monthly') {
            // For monthly plans with no member data, assume an average of 2 members
            userShare = plan.cost / 2;
          }
          
          canceledPlanSavings += userShare;
        } catch (savingsError) {
          console.error('Error calculating savings for plan:', plan.id, savingsError);
          // If there's an error, just add the full cost as a fallback
          canceledPlanSavings += plan.cost;
        }
      }

      // Total savings is the sum of canceled plan savings and shared plan savings
      const totalSavings = canceledPlanSavings + sharedPlanSavings;

      const response = {
        currentMonthSpending: totalMonthlySpending,
        planCount,
        totalSavings,
        canceledPlanCount: canceledPlans.length,
        canceledPlanSavings,
        sharedPlanSavings
      };

      console.log('Analytics response:', response);
      return NextResponse.json(response);
    } catch (dbError) {
      console.error("Database error in analytics:", dbError);
      // Return default values with error
      return NextResponse.json({
        error: "Database error while fetching analytics",
        currentMonthSpending: 0,
        planCount: 0,
        totalSavings: 0,
        canceledPlanCount: 0,
        sharedPlanSavings: 0
      });
    }
  } catch (error) {
    console.error("Error fetching analytics:", error);
    // Return default values with error
    return NextResponse.json({
      error: "Failed to fetch analytics",
      currentMonthSpending: 0,
      planCount: 0,
      totalSavings: 0,
      canceledPlanCount: 0,
      sharedPlanSavings: 0
    });
  }
} 