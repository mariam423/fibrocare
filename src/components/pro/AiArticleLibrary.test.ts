import { describe, expect, it } from "vitest";
import { dedupeArticles } from "./AiArticleLibrary";
import type { AiArticle } from "./AiArticleCard";

/**
 * Tests for the library's dedup contract.
 *
 * The server can return the same curated topic under different `id`s
 * (e.g. a fresh post generated today vs. an older post that was
 * already in the feed before a backfill). The library must collapse
 * those to a single card, keeping the most recent by `createdAt` and
 * preferring the row whose `slug` matches the curated topic.
 */

function makeArticle(overrides: Partial<AiArticle>): AiArticle {
  return {
    id: overrides.id ?? "id-default",
    title: overrides.title ?? "title",
    summary: overrides.summary ?? "summary",
    content: overrides.content ?? "content",
    tags: overrides.tags ?? [],
    createdAt: overrides.createdAt ?? "2026-01-01T00:00:00.000Z",
    authorName: overrides.authorName ?? "Dr. X",
    authorTitle: overrides.authorTitle ?? "MD",
    authorityLabel: overrides.authorityLabel ?? "Mayo Clinic",
    readingMinutes: overrides.readingMinutes ?? 5,
    slug: overrides.slug,
    topicId: overrides.topicId,
  };
}

describe("dedupeArticles", () => {
  it("returns the input unchanged when the list is empty", () => {
    expect(dedupeArticles([])).toEqual([]);
  });

  it("returns the input unchanged when the list has one item", () => {
    const a = makeArticle({ id: "a" });
    expect(dedupeArticles([a])).toEqual([a]);
  });

  it("collapses two posts that share the same slug, keeping the newer one", () => {
    const older = makeArticle({
      id: "old",
      slug: "sleep-hygiene",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    const newer = makeArticle({
      id: "new",
      slug: "sleep-hygiene",
      createdAt: "2026-02-01T00:00:00.000Z",
    });
    const out = dedupeArticles([older, newer]);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("new");
  });

  it("orders before the dedup so the first writer wins", () => {
    // Given newest-first input, the dedup drops later copies.
    const a = makeArticle({ id: "a", slug: "s", createdAt: "2026-03-01T00:00:00.000Z" });
    const b = makeArticle({ id: "b", slug: "s", createdAt: "2026-01-01T00:00:00.000Z" });
    const out = dedupeArticles([a, b]);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("a");
  });

  it("falls back to topicId when slug is missing", () => {
    const a = makeArticle({ id: "a", topicId: "brain-fog" });
    const b = makeArticle({ id: "b", topicId: "brain-fog" });
    const out = dedupeArticles([a, b]);
    expect(out).toHaveLength(1);
  });

  it("falls back to id when both slug and topicId are missing", () => {
    const a = makeArticle({ id: "only-id" });
    const out = dedupeArticles([a]);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("only-id");
  });

  it("keeps posts that have different curated slugs", () => {
    const sleep = makeArticle({ id: "sleep", slug: "sleep-hygiene" });
    const movement = makeArticle({ id: "movement", slug: "gentle-movement" });
    const out = dedupeArticles([sleep, movement]);
    expect(out).toHaveLength(2);
    expect(out.map((a) => a.id).sort()).toEqual(["movement", "sleep"]);
  });

  it("does not mutate the input array", () => {
    const a = makeArticle({ id: "a", slug: "s1" });
    const b = makeArticle({ id: "b", slug: "s1" });
    const input = [a, b];
    const copy = [...input];
    dedupeArticles(input);
    expect(input).toEqual(copy);
  });

  it("handles a realistic mixed list with multiple topic groups", () => {
    const list: AiArticle[] = [
      makeArticle({ id: "s1", slug: "sleep-hygiene", createdAt: "2026-03-01T00:00:00.000Z" }),
      makeArticle({ id: "s2", slug: "sleep-hygiene", createdAt: "2026-01-01T00:00:00.000Z" }),
      makeArticle({ id: "g1", slug: "gentle-movement", createdAt: "2026-02-01T00:00:00.000Z" }),
      makeArticle({ id: "g2", slug: "gentle-movement", createdAt: "2026-04-01T00:00:00.000Z" }),
      makeArticle({ id: "n1" }), // no slug, no topicId → kept by id
    ];
    const out = dedupeArticles(list);
    expect(out).toHaveLength(3);
    const ids = out.map((a) => a.id).sort();
    expect(ids).toEqual(["g2", "n1", "s1"]);
  });
});
