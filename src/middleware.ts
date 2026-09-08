import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getJwtSecret } from "@/lib/auth";

/**
 * Route protection for authenticated-only pages.
 * Validates the NextAuth JWT session cookie on every matching request.
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

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const secret = getJwtSecret();
  if (!secret) {
    console.warn(
      "[middleware] NEXTAUTH_SECRET is missing — skipping optimistic route guard."
    );
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret });

  if (!token?.sub) {
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based redirect: If a doctor tries to access the patient dashboard,
  // redirect them to the Doctor Hub.
  if (pathname === "/dashboard" && token.signupRole === "DOCTOR") {
    return NextResponse.redirect(new URL("/pro/doctor", request.url));
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
