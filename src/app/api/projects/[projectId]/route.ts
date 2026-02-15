import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const body = await req.json();
  const db = getDb();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  for (const key of ["title", "description", "status", "priority", "github_url", "position"]) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(body[key]);
    }
  }
  
  if (fields.length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  
  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(projectId);
  
  db.prepare(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  const db = getDb();
  db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
  return NextResponse.json({ ok: true });
}
