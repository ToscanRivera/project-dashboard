import { NextResponse } from 'next/server';
import { fetchProjects, demoData } from '@/lib/github';

export async function GET() {
  try {
    // Check if GitHub token is available
    if (!process.env.GITHUB_TOKEN) {
      console.log('No GitHub token found, returning demo data');
      return NextResponse.json(demoData.projects);
    }

    // Fetch real data from GitHub
    const projects = await fetchProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error in /api/github/projects:', error);
    
    // Fallback to demo data on error
    return NextResponse.json(demoData.projects);
  }
}