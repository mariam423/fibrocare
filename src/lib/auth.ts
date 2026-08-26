import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth configuration for credentials (email + password) and social
 * sign-in.
 *
 * Credentials are verified against the `passwordHash` stored in the User
 * table using bcrypt. The providers for Google/GitHub are enabled only when
 * their environment variables are present, so the app builds and runs
 * without credentials. Add the real values to your local `.env` to activate
 * social sign-in:
 *
 *   NEXTAUTH_SECRET=...
 *   NEXTAUTH_URL=http://localhost:3000
 *   GOOGLE_CLIENT_ID=...
 *   GOOGLE_CLIENT_SECRET=...
 *   GITHUB_CLIENT_ID=...
 *   GITHUB_CLIENT_SECRET=...
 */
/**
 * Dev-only fallback secret. Without NEXTAUTH_SECRET, NextAuth returns 500
 * on /api/auth/session|providers, which surfaces client-side as
 * [next-auth][error][CLIENT_FETCH_ERROR]. In development a deterministic
 * fallback keeps those endpoints answering valid JSON so `useSession`
 * degrades gracefully (an empty session object instead of a failed fetch).
 * Production still refuses to run without a real secret — silently signing
 * JWTs with a known value would be worse than a loud error.
 */
const DEV_FALLBACK_SECRET = "fibrocare-dev-only-fallback-secret-not-for-production";

/**
 * Resolve the JWT secret with a dev-only fallback. Production refuses to
 * run without a real NEXTAUTH_SECRET — silently signing JWTs with a known
 * value would be worse than a loud error. Shared with the route guard in
 * `src/proxy.ts` so both layers agree on the same secret.
 */
export function getJwtSecret(): string | undefined {
  return (
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : DEV_FALLBACK_SECRET)
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // Explicit cookie hardening instead of relying on inference: the JWT is
  // httpOnly (never readable by scripts), SameSite=Lax (CSRF-safe for
  // top-level navigations), and Secure in production (HTTPS-only).
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: getJwtSecret(),
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          signupRole: user.signupRole,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (user && "signupRole" in user) {
        token.signupRole = user.signupRole as "PATIENT" | "DOCTOR";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.signupRole) {
        session.user.signupRole = token.signupRole;
      }
      return session;
    },
  },
};
