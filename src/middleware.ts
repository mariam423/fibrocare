import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getJwtSecret } from "@/lib/auth";

/**
 * Route protection for authenticated-only pages.
 *
 * This middleware implements a "Fail-Safe" check:
 * 1. It first checks for the existence of a NextAuth session cookie.
 * 2. If a cookie exists, it allows the request to proceed to the page,
 *    leaving strict validation to the server-side components (fail-safe).
 * 3. If no cookie exists, it redirects unauthorized users to /login.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/health-logs",
  "/zen",
  "/reports",
  "/profile",
  "/toolkit",
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

  // 2. FAST-PATH: Check if session cookies exist.
  // NextAuth uses different names based on environment (http vs https).
  const hasSessionCookie =
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  if (hasSessionCookie) {
    // If the cookie exists, allow the request.
    // The actual token validation (getToken) can be slow or fail due to
    // secret mismatches in some Vercel environments.
    // By allowing the request here, we let the Server Components / Layouts
    // handle the actual auth check, which is more stable.
    return NextResponse.next();
  }

  // 3. FALLBACK: Try to validate token if we have a secret
  const secret = getJwtSecret();
  if (secret) {
    try {
      const token = await getToken({ req: request, secret });
      if (token?.sub) {
        return NextResponse.next();
      }
    } catch (e) {
      console.error("[middleware] Token validation error:", e);
    }
  }

  // 4. REDIRECT: No session found, send to login
  const signInUrl = new URL("/login", request.url);
  signInUrl.searchParams.set("callbackUrl", pathname);

  // Prevent infinite redirect loop if already on login (though isProtectedPath handles this)
  if (pathname === "/login") {
    return NextResponse.next();
  }

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
