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
    const refresh = searchParams.get('refresh') === 'true';

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
    
    // Try common domain extensions and variations
    let domains = [
      `${domain}.com`,
      `${domain}.io`,
      `${domain}.co`,
      `${domain}.org`,
      `${domain}.net`,
      `${domain}.app`,
      `${domain}.ai`,
      `the${domain}.com`,
      `get${domain}.com`,
      `${domain}app.com`,
      `my${domain}.com`,
      `${domain}hq.com`
    ];

    // If refreshing, shuffle the domains to try different ones first
    if (refresh) {
      domains = shuffleArray([...domains]);
    }

    // Check if any of the domains have a logo
    let logoUrl = null;
    
    // Use Promise.any to get the first successful response
    try {
      const fetchPromises = domains.map(async (domainToCheck) => {
        const testUrl = `https://logo.clearbit.com/${domainToCheck}`;
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          // Add a timeout to prevent hanging requests
          signal: AbortSignal.timeout(3000),
          // Add cache busting for refresh requests
          cache: refresh ? 'no-cache' : 'default'
        });
        
        if (!response.ok) {
          throw new Error(`Logo not found for ${domainToCheck}`);
        }
        
        return testUrl;
      });
      
      logoUrl = await Promise.any(fetchPromises);
    } catch (error) {
      console.error('All logo fetch attempts failed:', error);
      // Continue with fallback
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

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
} 