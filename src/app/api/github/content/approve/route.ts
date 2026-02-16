import { NextRequest, NextResponse } from 'next/server';
import { approvePR } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub integration not configured (demo mode)' },
        { status: 400 }
      );
    }

    const { prNumber } = await request.json();

    if (!prNumber || typeof prNumber !== 'number') {
      return NextResponse.json(
        { error: 'Invalid PR number' },
        { status: 400 }
      );
    }

    // Approve the PR
    await approvePR(prNumber);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/github/content/approve:', error);
    
    return NextResponse.json(
      { error: 'Failed to approve PR' },
      { status: 500 }
    );
  }
}