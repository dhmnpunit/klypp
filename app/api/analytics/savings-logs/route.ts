import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    console.log('Savings Logs API Session:', session);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      console.log('No authenticated session found in savings logs API');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the user directly by ID from the session
    const userId = session.user.id;
    console.log('Fetching savings logs for user ID:', userId);

    // Get the current month and 3 months ago for filtering
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
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
          logs: []
        });
      }
      
      // Initialize logs array
      let allLogs = [];
      
      try {
        // Fetch all canceled plans for this user
        const canceledPlans = await prisma.canceledPlan.findMany({
          where: {
            userId: userId,
            canceledAt: {
              gte: threeMonthsAgo
            }
          },
          orderBy: {
            canceledAt: 'desc'
          }
        });
        
        console.log(`Found ${canceledPlans.length} canceled plans for logs`);
        
        // Prepare canceled plan logs
        const canceledPlanLogs = canceledPlans.map(plan => {
          // Calculate the user's share based on member count
          // For canceled plans, we'll use the memberCount stored in the CanceledPlan model
          // This is more reliable than trying to query historical data
          const totalMembers = Math.max(plan.memberCount + 1, 1); // +1 for owner, minimum 1
          const userShare = plan.cost / totalMembers;
          
          return {
            id: plan.id,
            name: plan.name,
            cost: plan.cost,
            userShare: userShare,
            savedAmount: userShare, // For canceled plans, the savings is the user's share
            date: plan.canceledAt.toISOString().split('T')[0],
            type: 'canceled',
            wasOwner: plan.wasOwner,
            memberCount: plan.memberCount
          };
        });
        
        allLogs = [...canceledPlanLogs];
      } catch (canceledError) {
        console.error("Error fetching canceled plans:", canceledError);
        // Continue with empty canceled plans
      }
      
      try {
        // Fetch all active plans where the user is an owner or member
        const activePlans = await prisma.plan.findMany({
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
        
        console.log(`Found ${activePlans.length} active plans for logs`);
        
        // Prepare shared plan logs
        const sharedPlanLogs = activePlans
          .filter(plan => {
            // Only include plans with multiple members (shared plans)
            const totalMembers = plan.members.length + 1; // +1 for owner
            return totalMembers > 1;
          })
          .map(plan => {
            const totalMembers = plan.members.length + 1; // +1 for owner
            const userShare = plan.cost / totalMembers;
            const savedAmount = plan.cost - userShare; // Savings is the difference between full cost and share
            
            return {
              id: plan.id,
              name: plan.name,
              cost: plan.cost,
              userShare: userShare,
              savedAmount: savedAmount,
              date: plan.nextRenewalDate.toISOString().split('T')[0], // Next renewal date
              type: 'shared',
              isOwner: plan.ownerId === userId,
              memberCount: plan.members.length
            };
          });
        
        // Add shared plan logs to all logs
        allLogs = [...allLogs, ...sharedPlanLogs];
      } catch (activePlansError) {
        console.error("Error fetching active plans:", activePlansError);
        // Continue with just canceled plans if available
      }
      
      // Sort all logs by date (most recent first)
      allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Calculate summary
      let sharedSavings = 0;
      let canceledSavings = 0;
      
      allLogs.forEach(log => {
        if (log.type === 'shared') {
          sharedSavings += log.savedAmount;
        } else {
          canceledSavings += log.savedAmount;
        }
      });
      
      return NextResponse.json({ 
        logs: allLogs,
        summary: {
          totalSavings: sharedSavings + canceledSavings,
          sharedPlanSavings: sharedSavings,
          canceledPlanSavings: canceledSavings
        }
      });
    } catch (dbError) {
      console.error("Database error in savings logs:", dbError);
      return NextResponse.json({
        error: "Database error while fetching savings logs",
        logs: []
      });
    }
  } catch (error) {
    console.error("Error fetching savings logs:", error);
    return NextResponse.json({
      error: "Failed to fetch savings logs",
      logs: []
    });
  }
} 