import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

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
    const { name, cost, renewalFrequency, maxMembers } = data;

    console.log('Creating plan with data:', {
      name,
      cost,
      renewalFrequency,
      maxMembers,
      ownerId: user.id // Using the correct user ID
    });

    const plan = await prisma.plan.create({
      data: {
        name,
        cost: parseFloat(cost),
        renewalFrequency,
        maxMembers: parseInt(maxMembers),
        ownerId: user.id, // Using the correct user ID
        currentMembers: 1, // Starting with the owner
        nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
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
      const plans = await prisma.plan.findMany({
        where: {
          ownerId: user.id, // Using the correct user ID
        },
        orderBy: {
          createdAt: 'desc',
        },
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
          })
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