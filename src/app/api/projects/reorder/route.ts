import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, status, position } = await req.json();
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
  
  db.reorderProject(projectId, status, position);
  return NextResponse.json({ ok: true });
}
