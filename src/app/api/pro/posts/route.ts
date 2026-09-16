import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, type UserRole } from "@/lib/auth/rbac";
import {
  doctorPostRefineSchema,
  DOCTOR_POST_KINDS,
  type DoctorPostKind,
} from "@/lib/validations/doctorPosts";
import { sanitizeUserText, sanitizeUrl, looksMalicious } from "@/lib/security/sanitizer";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * REST surface for the Direct Doctor Publishing Hub.
 *
 *  GET  /api/pro/posts        — list posts (doctors see all kinds of their
 *                               own posts incl. pending; `kind` + `status`
 *                               filters; patients/anonymous only ever see
 *                               verified rows)
 *  POST /api/pro/posts        — create a post. Verified doctors ONLY
 *                               (role check + `doctor:publish` permission).
 *
 * Security:
 *  - Session required on every method; role/permission checked server-side.
 *  - CSRF: mutating requests must pass a same-origin `Origin` check
 *    (browsers always send it on cross-site form/fetch posts). API clients
 *    without a browser context cannot be CSRF'd, and are expected to use
 *    the server actions instead.
 *  - Zod validation BEFORE sanitization; `sanitizeUserText` strips
 *    HTML/script/URL-scheme payloads; `looksMalicious` payloads are
 *    dropped with a generic error (never echoed back).
 *  - Prisma parameterizes every query → SQL injection is structurally
 *    prevented; ownership is enforced by scoping reads/writes to the
 *    session-derived author id.
 */

/**
 * Explicit cross-origin allowlist for the Origin CSRF check.
 *
 * The `host`-match fallback below already covers same-origin browser
 * requests (including Vercel's production/preview domains, where Origin
 * host === request host), so this Set is only for deployments where a
 * custom domain fronts the app but the Origin header differs from the
 * request host (proxies that rewrite Host). Configure via:
 *  - NEXTAUTH_URL   — the canonical auth origin (also used by NextAuth)
 *  - APP_ORIGIN    — an extra allowed origin, e.g. a redirect target domain
 *  - NEXT_PUBLIC_SITE_URL — the public site origin (metadata + OG URLs)
 *
 * Empty entries are skipped so a half-configured env never allowlists an
 * empty-string origin.
 */
const ALLOWED_ORIGINS = new Set(
  [process.env.NEXTAUTH_URL, process.env.APP_ORIGIN, process.env.NEXT_PUBLIC_SITE_URL]
    .filter((o): o is string => Boolean(o && o.trim()))
    .map((o) => {
      try {
        // Normalize to scheme+host so trailing slashes/paths never cause
        // a false rejection (and never let a path smuggle an origin).
        const u = new URL(o.trim());
        return `${u.protocol}//${u.host}`;
      } catch {
        return "";
      }
    })
    .filter(Boolean)
);

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  // No Origin header → not a browser form/fetch cross-site request.
  if (!origin) return true;
  try {
    // Normalize the request origin to scheme+host (matches the allowlist
    // format) — paths on the Origin header must never win a match.
    const u = new URL(origin);
    const normalized = `${u.protocol}//${u.host}`;
    if (ALLOWED_ORIGINS.has(normalized)) return true;
    const host = request.headers.get("host");
    return Boolean(host) && u.host === host;
  } catch {
    return false;
  }
}

function unauthorized() {
  return Response.json({ error: "You must be signed in." }, { status: 401 });
}

function forbidden() {
  return Response.json(
    { error: "You must be a verified doctor to publish." },
    { status: 403 }
  );
}

/** List posts — doctors may read their own (any status); others verified only. */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const url = new URL(request.url);
  const kindParam = url.searchParams.get("kind");
  const statusParam = url.searchParams.get("status");
  const mineParam = url.searchParams.get("mine") === "1";
  const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit")) || 50, 200));

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!dbUser) return unauthorized();

  const isDoctor = hasPermission(dbUser.role as UserRole, "doctor:publish");

  const where: Record<string, unknown> = {};
  if (kindParam) {
    if (!DOCTOR_POST_KINDS.includes(kindParam as DoctorPostKind)) {
      return Response.json(
        { error: `kind must be one of: ${DOCTOR_POST_KINDS.join(", ")}` },
        { status: 400 }
      );
    }
    where.kind = kindParam;
  }

  if (mineParam && isDoctor) {
    // Doctors' own workspace: any status, session-derived ownership.
    where.authorId = session.user.id;
    if (statusParam) where.verifiedStatus = statusParam;
  } else {
    // Public feed: verified manual posts only.
    where.verifiedStatus = "verified";
    where.source = "manual";
  }

  const posts = await prisma.doctorPost.findMany({
    where,
    include: {
      author: { select: { id: true, name: true } },
      _count: {
        select: { reactions: true, comments: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });


  return Response.json({ posts });
}

/** Create a post — verified doctors only, Zod-validated and sanitized. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!dbUser || !hasPermission(dbUser.role as UserRole, "doctor:publish")) {
    return forbidden();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = doctorPostRefineSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid post." },
      { status: 400 }
    );
  }

  const title = sanitizeUserText(parsed.data.title, { maxLength: 120 });
  const content = sanitizeUserText(parsed.data.content, {
    maxLength: 10000,
    collapseWhitespace: false,
  });
  const tags = sanitizeUserText(parsed.data.tags, { maxLength: 200 });

  if (title.length < 5 || content.length < 20) {
    return Response.json(
      { error: "Title or content too short after sanitization." },
      { status: 400 }
    );
  }
  if (looksMalicious(title) || looksMalicious(content)) {
    return Response.json({ error: "Post rejected." }, { status: 400 });
  }

  // Media URLs are rendered as <img src> in the feed — only absolute
  // http(s) URLs survive `sanitizeUrl`, so `javascript:`/`data:` payloads
  // can never be persisted and later injected into the DOM.
  const rawMediaUrls = Array.isArray((body as { mediaUrls?: unknown }).mediaUrls)
    ? ((body as { mediaUrls: unknown[] }).mediaUrls)
    : [];
  const mediaUrls = rawMediaUrls
    .filter((url): url is string => typeof url === "string")
    .map((url) => sanitizeUrl(url))
    .filter((url): url is string => Boolean(url))
    .slice(0, 6);

  const post = await prisma.doctorPost.create({
    data: {
      title,
      content,
      tags,
      kind: parsed.data.kind,
      authorId: session.user.id,
      verifiedStatus: "pending",
      mediaUrls,
    },
  });

  revalidatePath("/pro/doctor");
  return Response.json(
    {
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        tags: post.tags,
        kind: post.kind,
        verifiedStatus: post.verifiedStatus,
      },
    },
    { status: 201 }
  );
}
