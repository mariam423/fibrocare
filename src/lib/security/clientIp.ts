/**
 * Best-effort client IP from forwarding headers.
 *
 * Deliberately tiny and free of Node-only modules so it can be imported
 * from `auth.ts` (which the Edge middleware bundles). `next/headers` is
 * Edge-compatible; node built-ins (`crypto`, `bcryptjs`, …) are not.
 */
export async function getClientIp(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip")?.trim() ||
      "unknown"
    );
  } catch {
    // Called outside a request scope (unit tests, build tooling) — the
    // limiter keys on "unknown" and stays deterministic.
    return "unknown";
  }
}