import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

/**
 * SECURITY NOTES:
 * 
 * CSRF Protection: NextAuth.js includes built-in CSRF protection by default.
 * It generates and validates CSRF tokens for all authentication requests.
 * This protection is automatically enabled and cannot be disabled unless
 * explicitly configured otherwise.
 * 
 * Rate Limiting: Consider implementing rate limiting for authentication
 * endpoints in production. Options include:
 * - Redis-based rate limiting with libraries like 'upstash-ratelimit'
 * - Edge middleware rate limiting (Vercel)
 * - Reverse proxy rate limiting (nginx, Cloudflare)
 * - Database-based request tracking for basic rate limiting
 * Current implementation: None - should be added for production deployment
 */

const providers = [];
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.userId = user.id;
        token.username = (user as any).login || user.name;
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