import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getJwtSecret, getSessionCookieName } from "@/lib/auth";

/**
 * Route protection for authenticated-only pages.
 *
 * Fail-closed: a request is only allowed through when the session JWT
 * actually verifies. The mere *presence* of a session cookie is never
 * trusted — an attacker can set `next-auth.session-token=forged` on their
 * own client, and the previous "cookie exists → allow" fast-path happily
 * served the protected page shell to anyone who did.
 *
 * `getToken` decrypts/verifies the JWT (A256GCM) using the same secret
 * the auth layer uses, so a forged or tampered cookie is rejected here
 * and the user is redirected to /login. Server Components / Server
 * Actions still perform their own session checks — this layer is the
 * first gate, not the only one.
 *
 * CRITICAL: the cookie name is derived from the deployment protocol via
 * `getSessionCookieName` in src/lib/auth.ts — the exact same helper that
 * configures the NextAuth session cookie. Deriving it independently
 * (e.g. from the https/VERCEL environment inside getToken's defaults)
 * resolves to `__Secure-next-auth.session-token` on Vercel while this app
 * wrote `next-auth.session-token` — a mismatch that made `getToken` return
 * null and bounced every logged-in user into a redirect loop.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/health-logs",
  "/zen",
  "/reports",
  "/profile",
  "/toolkit",
  "/clinical",
  "/diet",
  "/fog-shield",
  "/pro",
];

function isProtectedPath(pathname: string): boolean {
  return (
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignore non-protected paths immediately
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    return NextResponse.next();
  }

  // The cookie name is derived from the deployment's protocol by the same
  // helper src/lib/auth.ts uses to WRITE the cookie — on HTTPS deployments
  // that name carries the browser-enforced `__Secure-` prefix. Both sides
  // must always agree: a mismatch made getToken return null on Vercel and
  // bounced every logged-in user into a redirect loop.
  const SESSION_COOKIE = getSessionCookieName();

  // 2. Validate the session token. No cookie, or an invalid/forged
  //    cookie → redirect to login. This is the fail-closed path.
  const secret = getJwtSecret();
  if (secret) {
    try {
      const token = await getToken({
        req: request,
        secret,
        // Always read the cookie under the exact name src/lib/auth.ts
        // writes, regardless of the deployment's https/VERCEL environment.
        cookieName: SESSION_COOKIE,
      });
      if (token?.sub) {
        return NextResponse.next();
      }
    } catch (e) {
      console.error("[middleware] Token validation error:", e);
      // If decryption fails, the token is corrupted or the secret changed.
      // Fail CLOSED: clear the undecryptable cookie and bounce to /login.
      // (The previous `NextResponse.next()` here served the protected page
      // shell to any request whose cookie failed verification — a fail-open
      // path that contradicted this middleware's own contract.)
      const signInUrl = new URL("/login", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(signInUrl);
      response.cookies.set(SESSION_COOKIE, "", {
        maxAge: 0,
        path: "/",
      });
      return response;
    }
  }

  // 3. REDIRECT: no valid session found, send to login
  const signInUrl = new URL("/login", request.url);
  signInUrl.searchParams.set("callbackUrl", pathname);

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (NextAuth and other API routes)
     * - _next/static, _next/image (static assets)
     * - favicon, sitemap, robots (metadata)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};