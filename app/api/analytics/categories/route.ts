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
    // In a real implementation, you would query the database for subscription categories
    
    const categories = [
      { name: 'Entertainment', value: 120, color: '#8b5cf6' },
      { name: 'Productivity', value: 80, color: '#3b82f6' },
      { name: 'Education', value: 60, color: '#10b981' },
      { name: 'Social', value: 40, color: '#f59e0b' },
      { name: 'Utilities', value: 30, color: '#ef4444' }
    ];

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching category data:", error);
    return NextResponse.json({ error: "Failed to fetch category data" }, { status: 500 });
  }
} 