import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Route protection for authenticated-only pages.
 *
 * Next 16 renamed middleware -> proxy. This runs on the Node runtime and
 * validates the NextAuth JWT session cookie on every matching request before
 * the route renders. It is an optimistic check: the server actions and route
 * handlers must also verify the session (see src/app/actions.ts).
 *
 * Protected: the dashboard (`/dashboard`), health-log viewer (`/health-logs`),
 * Zen portal (`/zen`), reports (`/reports`), and profile (`/profile`).
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/health-logs",
  "/zen",
  "/reports",
  "/profile",
  "/toolkit",
];

function isProtectedPath(pathname: string): boolean {
  return (
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (NextAuth and other API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     *
     * Prefetch requests (Link prefetches send `next-router-prefetch` and/or
     * `purpose: prefetch`) are deliberately excluded. Otherwise a logged-out
     * prefetch of a protected route would cache a redirect in the router
     * cache, and a later back/forward navigation could be served that stale
     * redirect, trapping the user instead of restoring the previous page.
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
