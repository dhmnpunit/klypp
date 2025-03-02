import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the user directly by ID from the session
    const userId = session.user.id;
    
    // For now, we'll generate mock data
    // In a real implementation, you would query the database for historical spending data
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Generate data for the last 6 months
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
      
      // Base spending between $200-$400
      const baseSpending = 200 + Math.random() * 200;
      
      // Savings between 10-30% of spending
      const savingsPercentage = 0.1 + Math.random() * 0.2;
      
      data.push({
        month: months[monthIndex],
        spending: parseFloat(baseSpending.toFixed(2)),
        savings: parseFloat((baseSpending * savingsPercentage).toFixed(2))
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching monthly trend data:", error);
    return NextResponse.json({ error: "Failed to fetch monthly trend data" }, { status: 500 });
  }
} 