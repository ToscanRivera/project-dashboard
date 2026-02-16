import { NextResponse } from 'next/server';
import { fetchContentPRs } from '@/lib/github';
import { getUserId } from '@/lib/get-user-id';

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
    }
    const prs = await fetchContentPRs();
    return NextResponse.json(prs);
  } catch (error) {
    console.error('Error in /api/github/content:', error);
    return NextResponse.json({ error: "Failed to fetch content PRs" }, { status: 500 });
  }
}
