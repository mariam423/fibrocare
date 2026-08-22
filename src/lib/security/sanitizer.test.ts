import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  sanitizeUserText,
  sanitizeUrl,
  looksMalicious,
} from "./sanitizer";

describe("sanitizeUserText", () => {
  it("passes plain text through unchanged", () => {
    expect(sanitizeUserText("Left shoulder hurts, slept badly")).toBe("Left shoulder hurts, slept badly");
  });

  it("preserves Arabic text and diacritics", () => {
    expect(sanitizeUserText("ألم شديد في الكتف الأيسر")).toBe("ألم شديد في الكتف الأيسر");
  });

  it("strips script tags and their content", () => {
    expect(sanitizeUserText("note<script>alert(1)</script>rest")).toBe("noterest");
    expect(sanitizeUserText("ok <iframe src=\"evil\"></iframe> done")).toBe("ok done");
  });

  it("removes standalone tags but keeps the surrounding text", () => {
    expect(sanitizeUserText("pain <b>8/10</b> today")).toBe("pain 8/10 today");
  });

  it("neutralizes entity-encoded tags", () => {
    expect(sanitizeUserText("&lt;script&gt;alert(1)&lt;/script&gt; hello")).toBe("hello");
  });

  it("kills the whole javascript:/data: payload, not just the scheme", () => {
    expect(sanitizeUserText("click javascript:alert(document.cookie)")).toBe("click");
    expect(sanitizeUserText("data:text/html;base64,AAAA")).toBe("");
  });

  it("strips control and bidi-override characters", () => {
    expect(sanitizeUserText("hello\u202Eworld")).toBe("helloworld");
    expect(sanitizeUserText("a\u0000b")).toBe("ab");
  });

  it("enforces the length cap", () => {
    expect(sanitizeUserText("x".repeat(5000), { maxLength: 100 }).length).toBe(100);
  });

  it("collapses whitespace runs", () => {
    expect(sanitizeUserText("too   much\n\n space\t here")).toBe("too much space here");
  });

  it("handles non-string input defensively", () => {
    expect(sanitizeUserText(undefined as unknown as string)).toBe("");
  });
});

describe("escapeHtml", () => {
  it("escapes the dangerous five", () => {
    expect(escapeHtml(`<a href="x" class='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; class=&#39;y&#39;&gt;&amp;&lt;/a&gt;"
    );
  });
});

describe("sanitizeUrl", () => {
  it("allows https URLs", () => {
    expect(sanitizeUrl("https://youtube.com/watch?v=abc")).toBe("https://youtube.com/watch?v=abc");
  });

  it("allows same-origin relative paths", () => {
    expect(sanitizeUrl("/resources/exercises")).toBe("/resources/exercises");
  });

  it("blocks javascript and data URLs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("data:text/html;base64,xxx")).toBeNull();
  });

  it("blocks arbitrary protocol schemes", () => {
    expect(sanitizeUrl("vbscript:msgbox")).toBeNull();
  });
});

describe("looksMalicious", () => {
  it("flags injection attempts", () => {
    expect(looksMalicious("<script>x</script>")).toBe(true);
    expect(looksMalicious("<img src=x onerror=1>")).toBe(true);
    expect(looksMalicious("javascript:alert(1)")).toBe(true);
  });

  it("does not flag ordinary text (including Arabic)", () => {
    expect(looksMalicious("pain 7/10 in my knees")).toBe(false);
    expect(looksMalicious("ألم في الركبتين")).toBe(false);
    expect(looksMalicious("3 < 5 and 5 > 4")).toBe(false);
  });
});
