import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

// Only these GitHub usernames can access the dashboard
const ALLOWED_USERS = ["Rene-Rivera", "ToscanRivera"];

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, profile }) {
      const username = (profile as any)?.login || "";
      if (!ALLOWED_USERS.includes(username)) {
        return false; // Reject unauthorized users
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account && user) {
        token.userId = user.id;
        token.username = (profile as any)?.login || (user as any).login || user.name;
        token.avatar = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).username = token.username;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
};
