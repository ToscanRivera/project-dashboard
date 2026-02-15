import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * TODO: Add rate limiting to prevent API abuse
 * Consider implementing:
 * - Per-user request limits (e.g., 100 requests per hour)
 * - Per-IP request limits for unauthenticated requests
 * - Exponential backoff for repeated failed requests
 */

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const boardId = req.nextUrl.searchParams.get("boardId");
  if (!boardId) return NextResponse.json({ error: "boardId required" }, { status: 400 });
  const userId = Number((session.user as any).id);
  return NextResponse.json(db.getProjects(Number(boardId), userId));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const userId = Number((session.user as any).id);
  
  // Verify the user owns the board they're trying to create a project in
  const userBoards = db.getBoards(userId);
  const boardExists = userBoards.some(board => board.id === body.board_id);
  if (!boardExists) {
    return NextResponse.json({ error: "Forbidden: Board not found or access denied" }, { status: 403 });
  }
  
  const project = db.createProject(body);
  return NextResponse.json(project);
}
