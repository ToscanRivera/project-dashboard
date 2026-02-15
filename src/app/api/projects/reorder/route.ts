import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, status, position } = await req.json();
  const db = getDb();
  db.prepare("UPDATE projects SET status = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, position, projectId);
  return NextResponse.json({ ok: true });
}
