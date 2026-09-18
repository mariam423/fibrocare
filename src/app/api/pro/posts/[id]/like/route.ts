import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

  // We only support "like" for the social feed interaction
  const kind = "like";

  const existing = await prisma.articleReaction.findUnique({
    where: {
      userId_postId_kind: {
        userId,
        postId,
        kind,
      },
    },
  });

  if (existing) {
    // Idempotent, ownership-scoped toggle-off: a concurrent request that
    // already removed the reaction can never make this path throw.
    await prisma.articleReaction.deleteMany({
      where: { userId, postId, kind },
    });
    return Response.json({ liked: false });
  }

  try {
    await prisma.articleReaction.create({
      data: {
        userId,
        postId,
        kind,
      },
    });
  } catch {
    // Unknown postId (FK violation) or a concurrent double-toggle —
    // report a clean 404 instead of an unhandled 500.
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  return Response.json({ liked: true });
}
