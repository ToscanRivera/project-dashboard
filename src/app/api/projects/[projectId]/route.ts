import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const userId = Number((session.user as any).id);
  
  // Verify ownership: check if project exists in any of user's boards
  const userBoards = db.getBoards(userId);
  let projectExists = false;
  for (const board of userBoards) {
    const projects = db.getProjects(board.id, userId);
    if (projects.some(p => p.id === Number(projectId))) {
      projectExists = true;
      break;
    }
  }
  
  if (!projectExists) {
    return NextResponse.json({ error: "Forbidden: Project not found or access denied" }, { status: 403 });
  }
  
  const body = await req.json();
  db.updateProject(Number(projectId), body);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const userId = Number((session.user as any).id);
  
  // Verify ownership: check if project exists in any of user's boards
  const userBoards = db.getBoards(userId);
  let projectExists = false;
  for (const board of userBoards) {
    const projects = db.getProjects(board.id, userId);
    if (projects.some(p => p.id === Number(projectId))) {
      projectExists = true;
      break;
    }
  }
  
  if (!projectExists) {
    return NextResponse.json({ error: "Forbidden: Project not found or access denied" }, { status: 403 });
  }
  
  db.deleteProject(Number(projectId));
  return NextResponse.json({ ok: true });
}
