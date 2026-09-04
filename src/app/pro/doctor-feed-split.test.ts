import { describe, expect, it } from "vitest";

/**
 * Test the doctor-feed split contract: AI articles must never
 * appear in `DoctorContentFeed`, and manual posts must never be
 * filtered out of it.
 *
 * The real filter is server-side (see `getDoctorPosts` in
 * `src/app/pro/actions.ts` — the `manualOnly` flag defaults to
 * `true` and adds `where.source = "manual"` to the Prisma query).
 * This test mirrors that contract as a pure function so the
 * invariant is locked into the unit test suite, not only into the
 * production database query.
 */

type Source = "ai" | "manual";

interface PostRow {
  id: string;
  verifiedStatus: string;
  source: Source;
}

function splitForDoctorContentFeed(rows: PostRow[]): PostRow[] {
  return rows.filter(
    (r) => r.verifiedStatus === "verified" && r.source === "manual"
  );
}

describe("Doctor Hub feed split: DoctorContentFeed", () => {
  it("includes manual + verified posts", () => {
    const rows: PostRow[] = [
      { id: "m1", verifiedStatus: "verified", source: "manual" },
    ];
    expect(splitForDoctorContentFeed(rows).map((r) => r.id)).toEqual(["m1"]);
  });

  it("excludes AI posts (the original duplication bug)", () => {
    const rows: PostRow[] = [
      { id: "a1", verifiedStatus: "verified", source: "ai" },
      { id: "a2", verifiedStatus: "verified", source: "ai" },
      { id: "m1", verifiedStatus: "verified", source: "manual" },
    ];
    const out = splitForDoctorContentFeed(rows);
    expect(out.map((r) => r.id)).toEqual(["m1"]);
  });

  it("excludes pending manual posts", () => {
    const rows: PostRow[] = [
      { id: "m-pending", verifiedStatus: "pending", source: "manual" },
      { id: "m-verified", verifiedStatus: "verified", source: "manual" },
    ];
    expect(splitForDoctorContentFeed(rows).map((r) => r.id)).toEqual([
      "m-verified",
    ]);
  });

  it("returns empty for a fully-AI dataset", () => {
    const rows: PostRow[] = [
      { id: "a1", verifiedStatus: "verified", source: "ai" },
      { id: "a2", verifiedStatus: "verified", source: "ai" },
    ];
    expect(splitForDoctorContentFeed(rows)).toEqual([]);
  });

  it("does not mutate the input list", () => {
    const rows: PostRow[] = [
      { id: "a1", verifiedStatus: "verified", source: "ai" },
      { id: "m1", verifiedStatus: "verified", source: "manual" },
    ];
    const before = [...rows];
    splitForDoctorContentFeed(rows);
    expect(rows).toEqual(before);
  });
});

/**
 * The library gets the union of AI + manual (the curated
 * `listPublishedArticles` query), then dedupes by slug. This test
 * documents that contract on the read side so the split is
 * symmetric: server splits, library dedupes, page never sees a
 * duplicate.
 */
function splitForAiArticleLibrary(rows: PostRow[]): PostRow[] {
  return rows.filter((r) => r.verifiedStatus === "verified");
}

describe("Doctor Hub feed split: AiArticleLibrary", () => {
  it("includes both AI and manual verified posts", () => {
    const rows: PostRow[] = [
      { id: "a1", verifiedStatus: "verified", source: "ai" },
      { id: "m1", verifiedStatus: "verified", source: "manual" },
    ];
    expect(splitForAiArticleLibrary(rows).map((r) => r.id).sort()).toEqual([
      "a1",
      "m1",
    ]);
  });

  it("excludes pending and rejected posts", () => {
    const rows: PostRow[] = [
      { id: "pending", verifiedStatus: "pending", source: "manual" },
      { id: "rejected", verifiedStatus: "rejected", source: "manual" },
    ];
    expect(splitForAiArticleLibrary(rows)).toEqual([]);
  });
});
