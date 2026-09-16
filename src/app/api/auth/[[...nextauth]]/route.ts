import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

/**
 * The catch-all is optional (`[[...nextauth]]`), so a bare `GET /api/auth`
 * (no sub-path) reaches this handler with an empty param array. NextAuth
 * crashes on that shape with an opaque 500 (config leak); return a clean
 * 404 instead. All real flows carry at least one segment (callback, csrf,
 * providers, session, signin, signout).
 */
async function guardNextAuthPath(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth?: string[] | null }> }
) {
  const { nextauth } = await ctx.params;
  if (!Array.isArray(nextauth) || nextauth.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Settle params before handing off: Next 16 params are Promises, and
  // NextAuth v4 expects a plain object.
  return handler(req, { ...ctx, params: { nextauth } });
}

export { guardNextAuthPath as GET, guardNextAuthPath as POST };