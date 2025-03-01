import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the company name from the query parameters
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('name');

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Clean the company name to get better results
    // Remove common subscription terms like "subscription", "plan", etc.
    const cleanedName = companyName
      .replace(/\b(subscription|plan|premium|basic|standard|pro|plus)\b/gi, '')
      .trim();

    // Use Clearbit Logo API to find the logo
    // Format: https://logo.clearbit.com/{domain}
    // We'll try to guess the domain from the company name
    const domain = cleanedName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
    
    // Try common domain extensions
    const domains = [
      `${domain}.com`,
      `${domain}.io`,
      `${domain}.co`,
      `${domain}.org`,
      `${domain}.net`
    ];

    // Check if any of the domains have a logo
    let logoUrl = null;
    
    for (const domainToCheck of domains) {
      const testUrl = `https://logo.clearbit.com/${domainToCheck}`;
      try {
        const response = await fetch(testUrl, { method: 'HEAD' });
        if (response.ok) {
          logoUrl = testUrl;
          break;
        }
      } catch (error) {
        // Continue to the next domain
        console.error(`Error checking logo for ${domainToCheck}:`, error);
      }
    }

    // If no logo found, use a fallback
    if (!logoUrl) {
      // Generate a placeholder with the first letter of the company name
      const firstLetter = cleanedName.charAt(0).toUpperCase();
      logoUrl = `https://ui-avatars.com/api/?name=${firstLetter}&background=random&color=fff&size=128`;
    }

    return NextResponse.json({ logoUrl });
  } catch (error) {
    console.error('Failed to search for logo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search for logo' },
      { status: 500 }
    );
  }
} 