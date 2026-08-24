/**
 * Text chunking utility for corpus ingestion.
 *
 * Splits long documents into overlapping, sentence-aligned chunks so future
 * knowledge-base growth (longer guideline summaries, imported research
 * digests) can flow through the same `KnowledgeChunk` pipeline. Pure and
 * deterministic; never splits mid-sentence when avoidable.
 */

export interface ChunkOptions {
  /** Target maximum characters per chunk (default 800). */
  maxChars?: number;
  /** Characters of overlap between consecutive chunks (default 100). */
  overlap?: number;
}

/**
 * Split `text` into chunks of at most `maxChars`, breaking on sentence ends
 * where possible, with `overlap` characters carried into the next chunk for
 * continuity. Returns [""]-free output: empty input yields [].
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const maxChars = Math.max(120, options.maxChars ?? 800);
  const overlap = Math.min(Math.max(0, options.overlap ?? 100), Math.floor(maxChars / 2));

  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxChars) return [trimmed];

  // Sentence-ish boundaries: ., !, ?, newline, Arabic full stop.
  const sentences =
    trimmed.match(/[^.!?\n\u06D4]+[.!?\n\u06D4]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];

  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    const value = current.trim();
    if (value) chunks.push(value);
    current = "";
  };

  for (const sentence of sentences) {
    // A single monster sentence still has to respect the cap.
    if (sentence.length > maxChars) {
      pushCurrent();
      for (let i = 0; i < sentence.length; i += maxChars - overlap) {
        const piece = sentence.slice(i, i + maxChars).trim();
        if (piece) chunks.push(piece);
      }
      continue;
    }

    if (current.length + sentence.length + 1 > maxChars) {
      pushCurrent();
      // Carry the tail of the previous chunk as overlap context.
      const previous = chunks[chunks.length - 1];
      if (previous && overlap > 0) {
        current = previous.slice(-overlap) + " ";
      }
    }
    current += (current ? " " : "") + sentence;
  }
  pushCurrent();

  return chunks;
}
