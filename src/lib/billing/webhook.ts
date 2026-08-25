/**
 * Billing webhook verification (Stripe / Lemon Squeezy), dependency-free.
 *
 * Both providers sign the raw request body with HMAC-SHA256 using a shared
 * secret configured on the server:
 *
 *  - Stripe sends `Stripe-Signature: t=<timestamp>,v1=<hex>` where the hex is
 *    HMAC-SHA256(secret, `${timestamp}.${rawBody}`). We also enforce a
 *    freshness window so captured webhooks can't be replayed.
 *  - Lemon Squeezy sends `X-Signature: <hex>` = HMAC-SHA256(secret, rawBody).
 *
 * Everything here is pure (node:crypto only) so it is unit-testable without
 * an HTTP server; the route in `src/app/api/webhooks/billing/route.ts` stays
 * a thin shell: verify → parse → persist.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { subscriptionFromWebhook, type Subscription } from "@/lib/billing/subscription";

export type BillingProvider = "stripe" | "lemon-squeezy";

/** The request headers the webhook route forwards for verification. */
export interface WebhookHeaders {
  "stripe-signature"?: string;
  "x-signature"?: string;
}

export interface WebhookSecrets {
  stripe?: string;
  lemonSqueezy?: string;
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verify a Stripe webhook signature.
 * Header format: `t=<unix-ts>,v1=<hex-sig>[,v1=<hex-sig>…]`.
 * Returns false for malformed, stale (> tolerance), or mismatched headers.
 */
export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300
): boolean {
  const parts = new Map<string, string>();
  for (const item of signatureHeader.split(",")) {
    const eq = item.indexOf("=");
    if (eq === -1) continue;
    const key = item.slice(0, eq).trim();
    const value = item.slice(eq + 1).trim();
    if (key) parts.set(key, value);
  }
  const timestamp = parts.get("t");
  const signature = parts.get("v1");
  if (!timestamp || !signature) return false;

  // Replay protection: reject signatures older than the tolerance window.
  const ageSeconds = Date.now() / 1000 - Number(timestamp);
  if (!Number.isFinite(ageSeconds) || Math.abs(ageSeconds) > toleranceSeconds) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

/** Verify a Lemon Squeezy webhook signature (`X-Signature` header). */
export function verifyLemonSqueezySignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signatureHeader);
}

/** Detect the provider from the presence of its signature header. */
export function detectBillingProvider(
  headers: WebhookHeaders
): BillingProvider | null {
  if (headers["stripe-signature"]) return "stripe";
  if (headers["x-signature"]) return "lemon-squeezy";
  return null;
}

export type WebhookVerifyResult =
  | { ok: true; provider: BillingProvider; subscription: Subscription | null }
  | { ok: false; status: 400 | 401 | 503; error: string };

/**
 * Full verification pipeline: detect provider → check the secret is
 * configured → verify the signature → parse the event into a Subscription.
 *
 * `subscription` is null for events that don't change tier state (the route
 * still acknowledges them with 200 so the provider stops retrying).
 */
export function verifyAndParseWebhook(
  rawBody: string,
  headers: WebhookHeaders,
  secrets: WebhookSecrets
): WebhookVerifyResult {
  const provider = detectBillingProvider(headers);
  if (!provider) {
    return {
      ok: false,
      status: 400,
      error: "Missing billing signature header.",
    };
  }

  if (provider === "stripe") {
    if (!secrets.stripe) {
      return {
        ok: false,
        status: 503,
        error: "STRIPE_WEBHOOK_SECRET is not configured on the server.",
      };
    }
    const header = headers["stripe-signature"];
    if (
      !header ||
      !verifyStripeSignature(rawBody, header, secrets.stripe)
    ) {
      return { ok: false, status: 401, error: "Invalid Stripe signature." };
    }
  } else {
    if (!secrets.lemonSqueezy) {
      return {
        ok: false,
        status: 503,
        error: "LEMON_SQUEEZY_WEBHOOK_SECRET is not configured on the server.",
      };
    }
    const header = headers["x-signature"];
    if (
      !header ||
      !verifyLemonSqueezySignature(rawBody, header, secrets.lemonSqueezy)
    ) {
      return {
        ok: false,
        status: 401,
        error: "Invalid Lemon Squeezy signature.",
      };
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, error: "Webhook body is not valid JSON." };
  }

  return { ok: true, provider, subscription: subscriptionFromWebhook(parsed) };
}
