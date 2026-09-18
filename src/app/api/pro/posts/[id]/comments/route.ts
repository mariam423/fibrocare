import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sanitizeUserText } from "@/lib/security/sanitizer";

export const dynamic = "force-dynamic";

const commentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

/**
 * CSRF gate — same contract as the posts route: browsers always send an
 * Origin header on cross-site fetch/form POSTs, so any mismatching Origin
 * is rejected. Same-origin requests (and non-browser clients, which send
 * no Origin) pass. Defense-in-depth on top of the SameSite=Lax session
 * cookie, matching the POST handler in `../route.ts`.
 */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = request.headers.get("host") ?? new URL(request.url).host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const postId = (await params).id;

  // Broken-access-control fix: comments were previously readable by anyone
  // (no session), which also exposed commenter ids/names and leaked the
  // comment thread of pending/rejected posts. The reader must now be
  // signed in, and the post must exist — visibility mirrors the reactions
  // rule: only verified posts expose their comment thread publicly.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.doctorPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      verifiedStatus: true,
      authorId: true,
    },
  });
  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  // Pending/rejected drafts are visible in-thread only to their author.
  if (post.verifiedStatus !== "verified") {
    if (post.authorId !== session.user.id) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ comments });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postId = (await params).id;
  const userId = session.user.id;

  // Same visibility contract as GET: comments may only be added to posts
  // that exist, and non-verified drafts are author-only.
  const post = await prisma.doctorPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      verifiedStatus: true,
      authorId: true,
    },
  });
  if (!post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.verifiedStatus !== "verified" && post.authorId !== userId) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid content" }, { status: 400 });
    }

    // Length is already schema-capped; sanitize strips HTML/script/URL
    // payloads before persistence (same layer as doctor posts/messages).
    const content = sanitizeUserText(parsed.data.content, { maxLength: 1000 });
    if (!content) {
      return Response.json({ error: "Invalid content" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        postId,
      },
    });

    return Response.json(comment, { status: 201 });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
