import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserId(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  // Use seed user 1 — projects come from GitHub API, this is for legacy boards
  return 1;
}
