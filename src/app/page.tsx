import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  // Skip auth if GitHub OAuth is not configured
  const hasAuth = !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET);
  
  if (hasAuth) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    return <Dashboard user={session.user as any} />;
  }
  
  // Demo mode — no auth required
  return <Dashboard user={{ name: "Demo User", email: "demo@example.com", image: null } as any} />;
}
