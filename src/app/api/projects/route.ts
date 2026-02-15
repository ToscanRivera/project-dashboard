import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const boardId = req.nextUrl.searchParams.get("boardId");
  if (!boardId) return NextResponse.json({ error: "boardId required" }, { status: 400 });
  const db = getDb();
  const projects = db.prepare(
    "SELECT p.* FROM projects p JOIN boards b ON p.board_id = b.id WHERE p.board_id = ? AND b.user_id = ? ORDER BY p.position"
  ).all(boardId, (session.user as any).id);
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { board_id, title, description, status, priority, github_url } = body;
  if (!board_id || !title) return NextResponse.json({ error: "board_id and title required" }, { status: 400 });
  const db = getDb();
  // Verify board ownership
  const board = db.prepare("SELECT id FROM boards WHERE id = ? AND user_id = ?").get(board_id, (session.user as any).id);
  if (!board) return NextResponse.json({ error: "Board not found" }, { status: 404 });
  const maxPos = db.prepare("SELECT COALESCE(MAX(position), -1) as max FROM projects WHERE board_id = ? AND status = ?").get(board_id, status || "todo") as any;
  const result = db.prepare(
    "INSERT INTO projects (board_id, title, description, status, priority, github_url, position) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(board_id, title, description || "", status || "todo", priority || "medium", github_url || "", maxPos.max + 1);
  return NextResponse.json({ id: result.lastInsertRowid, ...body });
}
