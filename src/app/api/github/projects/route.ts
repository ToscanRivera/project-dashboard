import { NextResponse } from 'next/server';
import { fetchProjects } from '@/lib/github';
import { getUserId } from '@/lib/get-user-id';

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
    }
    const projects = await fetchProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in /api/github/projects:', error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
