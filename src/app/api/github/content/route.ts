import { NextResponse } from 'next/server';
import { fetchContentPRs, demoData } from '@/lib/github';

export async function GET() {
  try {
    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.log('No GitHub token found, returning demo content data');
      return NextResponse.json(demoData.contentPRs);
    }

    // Fetch real data from GitHub
    const prs = await fetchContentPRs();
    return NextResponse.json(prs);
  } catch (error) {
    console.error('Error in /api/github/content:', error);
    
    // Fallback to demo data on error
    return NextResponse.json(demoData.contentPRs);
  }
}