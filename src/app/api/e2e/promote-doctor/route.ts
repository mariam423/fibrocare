import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * E2E-only endpoint that promotes the currently signed-in user to the
 * `doctor` role so the Doctor Hub doctor surfaces (manual publishing
 * composer, own-posts workspace) can be exercised end-to-end.
 *
 * The route is completely disabled unless the dedicated E2E env var
 * `E2E_PROMOTE_TOKEN` is set, so this code path cannot run in
 * production even by accident:
 *
 *   - In dev without the env var: returns 404.
 *   - In dev with the env var: requires a matching `X-E2E-Token`
 *     header AND a valid session (the user must already be
 *     authenticated), then flips the DB role to `"doctor"`.
 *
 * Re-running is safe: the endpoint is idempotent.
 */
export async function POST(request: Request) {
  const expected = process.env.E2E_PROMOTE_TOKEN;
  // Hard-disable unless a token is configured AND we are not in production.
  if (!expected || process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const header = request.headers.get("x-e2e-token") ?? "";
  // Constant-time comparison to prevent timing oracle
  const maxLen = Math.max(header.length, expected.length);
  const headerBuf = Buffer.from(header.padEnd(maxLen, "\0"));
  const expectedBuf = Buffer.from(expected.padEnd(maxLen, "\0"));
  if (!crypto.timingSafeEqual(headerBuf, expectedBuf)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "doctor" },
    select: { id: true, role: true },
  });
  return NextResponse.json({ success: true, user });
}
