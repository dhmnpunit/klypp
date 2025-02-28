import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('API Session:', session);
    
    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await request.json();
    const { name, cost, renewalFrequency, maxMembers, startDate } = data;

    const planStartDate = new Date(startDate);
    const nextRenewalDate = calculateNextRenewalDate(planStartDate, renewalFrequency);

    console.log('Creating plan with data:', {
      name,
      cost,
      renewalFrequency,
      maxMembers,
      startDate,
      nextRenewalDate,
      ownerId: user.id
    });

    const plan = await prisma.plan.create({
      data: {
        name,
        cost: parseFloat(cost),
        renewalFrequency,
        maxMembers: parseInt(maxMembers),
        ownerId: user.id,
        currentMembers: 1,
        startDate: planStartDate,
        nextRenewalDate
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Failed to create plan. Detailed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create plan' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('API Session:', session);

    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
      // Fetch both owned plans and plans where user is a member
      const plans = await prisma.plan.findMany({
        where: {
          OR: [
            { ownerId: user.id }, // Plans owned by the user
            {
              members: {
                some: {
                  userId: user.id,
                  status: 'ACCEPTED' // Changed from 'ACTIVE' to 'ACCEPTED'
                }
              }
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          members: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Calculate days until renewal for each plan
      const plansWithRenewalInfo = plans.map(plan => {
        const now = new Date();
        const renewalDate = new Date(plan.nextRenewalDate);
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...plan,
          renewsIn: daysUntilRenewal,
          renewalDate: plan.nextRenewalDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          isOwner: plan.ownerId === user.id // Add flag to indicate if user is the owner
        };
      });

      return NextResponse.json(plansWithRenewalInfo);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch plans from database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
} 