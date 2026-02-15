import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const userId = (session.user as any).id;
  const boards = db.prepare("SELECT * FROM boards WHERE user_id = ? ORDER BY created_at").all(userId);
  return NextResponse.json(boards);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const db = getDb();
  const userId = (session.user as any).id;
  const result = db.prepare("INSERT INTO boards (user_id, name) VALUES (?, ?)").run(userId, name);
  return NextResponse.json({ id: result.lastInsertRowid, name });
}
