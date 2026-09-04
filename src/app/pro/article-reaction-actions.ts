"use server";

/**
 * Server actions for the patient reaction buttons on AI-generated
 * Doctor Hub articles. Each user can react once per `(postId, kind)`,
 * and the same user can hold both a `like` and a `helpful` reaction
 * on the same article. Toggling a reaction that already exists
 * removes it (so the same button acts as a toggle in the UI).
 *
 * Reads are not done here — the client component fetches the count
 * and the "did I react?" state via a single read action
 * (`getArticleReactions`). Keeping the read separate from the write
 * is the standard pattern for "optimistic UI" toggles.
 */

import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AI_ARTICLES_TAG } from "@/app/pro/doctor-article-cache";

/** Allowed reaction kinds. Tightly bound so the DB never gets an
 *  arbitrary string in the `kind` column. */
const REACTION_KINDS = ["like", "helpful"] as const;
export type ReactionKind = (typeof REACTION_KINDS)[number];

function isReactionKind(value: unknown): value is ReactionKind {
  return typeof value === "string" && (REACTION_KINDS as readonly string[]).includes(value);
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function toggleArticleReaction(
  postId: string,
  kind: unknown
): Promise<
  | { success: true; reacted: boolean; kind: ReactionKind; postId: string }
  | { success: false; error: string }
> {
  if (typeof postId !== "string" || !postId) {
    return { success: false, error: "postId is required" };
  }
  if (!isReactionKind(kind)) {
    return { success: false, error: "Unknown reaction kind." };
  }
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "You must be signed in to react." };
  }
  try {
    // Verify the post exists and is verified (we don't expose reactions
    // on pending/rejected posts).
    const post = await prisma.doctorPost.findUnique({
      where: { id: postId },
      select: { id: true, verifiedStatus: true },
    });
    if (!post || post.verifiedStatus !== "verified") {
      return { success: false, error: "Article not found." };
    }
    const existing = await prisma.articleReaction.findUnique({
      where: { userId_postId_kind: { userId, postId, kind } },
    });
    if (existing) {
      await prisma.articleReaction.delete({
        where: { id: existing.id },
      });
      revalidateTag(AI_ARTICLES_TAG, "max");
      return { success: true, reacted: false, kind, postId };
    }
    await prisma.articleReaction.create({
      data: { userId, postId, kind },
    });
    revalidateTag(AI_ARTICLES_TAG, "max");
    return { success: true, reacted: true, kind, postId };
  } catch (error) {
    console.error("[article-reaction] toggle failed:", error);
    return {
      success: false,
      error: "Could not save your reaction. Please try again.",
    };
  }
}

export interface ArticleReactionCounts {
  postId: string;
  likes: number;
  helpful: number;
  /** True when the current user has reacted with the given kind. */
  liked: boolean;
  helpfulChecked: boolean;
  /** True when the request was made by a signed-in user. The reaction
   *  bar uses this to enable the buttons; a guest sees the buttons
   *  disabled with a sign-in hint. */
  signedIn: boolean;
}

/**
 * Read-side helper. Returns the like/helpful counts for one post plus
 * the signed-in user's own reaction state (both `false` for guests).
 *
 * Designed to be called from a Server Component so the data is
 * streamed in the initial HTML — no client round-trip is needed for
 * the badge to render with the right counts.
 */
export async function getArticleReactions(
  postId: string
): Promise<ArticleReactionCounts> {
  const empty: ArticleReactionCounts = {
    postId,
    likes: 0,
    helpful: 0,
    liked: false,
    helpfulChecked: false,
    signedIn: false,
  };
  if (typeof postId !== "string" || !postId) return empty;
  try {
    const userId = await getCurrentUserId();
    const grouped = await prisma.articleReaction.groupBy({
      by: ["kind"],
      where: { postId },
      _count: { _all: true },
    });
    const likes = grouped.find((g) => g.kind === "like")?._count._all ?? 0;
    const helpful = grouped.find((g) => g.kind === "helpful")?._count._all ?? 0;
    if (!userId) {
      return {
        postId,
        likes,
        helpful,
        liked: false,
        helpfulChecked: false,
        signedIn: false,
      };
    }
    const mine = await prisma.articleReaction.findMany({
      where: { postId, userId },
      select: { kind: true },
    });
    const liked = mine.some((r) => r.kind === "like");
    const helpfulChecked = mine.some((r) => r.kind === "helpful");
    return {
      postId,
      likes,
      helpful,
      liked,
      helpfulChecked,
      signedIn: true,
    };
  } catch (error) {
    console.error("[article-reaction] read failed:", error);
    return empty;
  }
}
