/**
 * GET /api/ai/articles/generate?topic=<topicId>
 *
 * Returns a verified, patient-friendly article for a curated topic. The
 * topic id is matched against a closed catalogue so the LLM can never pick
 * its own subject matter. If a post already exists for the topic, it is
 * returned as-is.
 *
 * Doctor Hub calls this on first visit (via the seed endpoint) so the
 * public feed always has content, and per-topic when a user picks a topic
 * from the generator picker.
 */

import { NextRequest } from "next/server";
import { ensureArticleForTopic, listArticleTopics } from "@/app/pro/doctor-article-actions";
import { listArticleTopicSchema } from "@/app/api/ai/articles/_schema";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const topicId = url.searchParams.get("topic") ?? url.searchParams.get("topicId");
  if (!topicId) {
    return Response.json(
      { error: "Missing ?topic=<topicId> parameter.", topics: await listArticleTopics() },
      { status: 400 }
    );
  }

  const parsed = listArticleTopicSchema.safeParse({ topicId });
  if (!parsed.success) {
    return Response.json(
      { error: "Unknown topic.", topics: await listArticleTopics() },
      { status: 400 }
    );
  }

  const result = await ensureArticleForTopic(parsed.data.topicId);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 });
  }
  return Response.json({ article: result.data });
}
