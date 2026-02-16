import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const hasAuth = !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET);

export async function getUserId(): Promise<number | null> {
  if (!hasAuth) return 1; // Demo mode — use seed user
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  // Always return 1 — seed data user. Projects now come from GitHub API.
  // The boards/in-memory layer is legacy, kept for backward compatibility.
  return 1;
}
