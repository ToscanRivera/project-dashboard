import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, status, position } = await req.json();
  db.reorderProject(projectId, status, position);
  return NextResponse.json({ success: true });
}
