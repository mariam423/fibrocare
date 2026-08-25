import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import {
  detectBillingProvider,
  verifyAndParseWebhook,
  verifyLemonSqueezySignature,
  verifyStripeSignature,
} from "./webhook";

const STRIPE_SECRET = "whsec_stripe_test_secret";
const LS_SECRET = "whsec_lemon_test_secret";

function signStripe(rawBody: string, secret = STRIPE_SECRET, offsetSeconds = 0) {
  const timestamp = Math.floor(Date.now() / 1000) + offsetSeconds;
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  return { header: `t=${timestamp},v1=${signature}`, timestamp };
}

function signLemonSqueezy(rawBody: string, secret = LS_SECRET) {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

const STRIPE_ACTIVATE_BODY = JSON.stringify({
  provider: "stripe",
  type: "customer.subscription.created",
  data: { object: { id: "sub_123", status: "active", current_period_end: 1798761600 } },
});

const LS_ACTIVATE_BODY = JSON.stringify({
  provider: "lemon-squeezy",
  meta: { event_name: "subscription_created" },
  data: { id: "ls_9", attributes: { status: "active", renews_at: "2027-06-01T00:00:00.000Z" } },
});

describe("verifyStripeSignature", () => {
  it("accepts a valid signature within the freshness window", () => {
    const { header } = signStripe(STRIPE_ACTIVATE_BODY);
    expect(verifyStripeSignature(STRIPE_ACTIVATE_BODY, header, STRIPE_SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const { header } = signStripe(STRIPE_ACTIVATE_BODY);
    expect(
      verifyStripeSignature(STRIPE_ACTIVATE_BODY + " ", header, STRIPE_SECRET)
    ).toBe(false);
  });

  it("rejects a signature made with the wrong secret", () => {
    const { header } = signStripe(STRIPE_ACTIVATE_BODY, "whsec_other");
    expect(verifyStripeSignature(STRIPE_ACTIVATE_BODY, header, STRIPE_SECRET)).toBe(false);
  });

  it("rejects stale signatures (replay protection)", () => {
    const { header } = signStripe(STRIPE_ACTIVATE_BODY, STRIPE_SECRET, -3600);
    expect(verifyStripeSignature(STRIPE_ACTIVATE_BODY, header, STRIPE_SECRET)).toBe(false);
  });

  it("rejects malformed headers", () => {
    expect(verifyStripeSignature(STRIPE_ACTIVATE_BODY, "nope", STRIPE_SECRET)).toBe(false);
    expect(verifyStripeSignature(STRIPE_ACTIVATE_BODY, "v1=abc", STRIPE_SECRET)).toBe(false);
  });

  it("accepts multi-signature headers (signature rotation)", () => {
    const { header, timestamp } = signStripe(STRIPE_ACTIVATE_BODY);
    const oldSig = createHmac("sha256", "whsec_old")
      .update(`${timestamp}.${STRIPE_ACTIVATE_BODY}`)
      .digest("hex");
    expect(
      verifyStripeSignature(STRIPE_ACTIVATE_BODY, `t=${timestamp},v1=${oldSig},${header}`, STRIPE_SECRET)
    ).toBe(true);
  });
});

describe("verifyLemonSqueezySignature", () => {
  it("accepts a valid signature", () => {
    const signature = signLemonSqueezy(LS_ACTIVATE_BODY);
    expect(verifyLemonSqueezySignature(LS_ACTIVATE_BODY, signature, LS_SECRET)).toBe(true);
  });

  it("rejects a tampered body or wrong secret", () => {
    const signature = signLemonSqueezy(LS_ACTIVATE_BODY);
    expect(verifyLemonSqueezySignature(LS_ACTIVATE_BODY + "x", signature, LS_SECRET)).toBe(false);
    expect(verifyLemonSqueezySignature(LS_ACTIVATE_BODY, signature, "whsec_other")).toBe(false);
  });
});

describe("detectBillingProvider", () => {
  it("detects each provider from its signature header", () => {
    expect(detectBillingProvider({ "stripe-signature": "t=1,v1=abc" })).toBe("stripe");
    expect(detectBillingProvider({ "x-signature": "abc" })).toBe("lemon-squeezy");
    expect(detectBillingProvider({})).toBeNull();
  });
});

describe("verifyAndParseWebhook", () => {
  it("verifies + parses a Stripe activation event", () => {
    const { header } = signStripe(STRIPE_ACTIVATE_BODY);
    const result = verifyAndParseWebhook(
      STRIPE_ACTIVATE_BODY,
      { "stripe-signature": header },
      { stripe: STRIPE_SECRET }
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("stripe");
      expect(result.subscription?.plan).toBe("pro");
      expect(result.subscription?.externalId).toBe("sub_123");
    }
  });

  it("verifies + parses a Lemon Squeezy activation event", () => {
    const signature = signLemonSqueezy(LS_ACTIVATE_BODY);
    const result = verifyAndParseWebhook(
      LS_ACTIVATE_BODY,
      { "x-signature": signature },
      { lemonSqueezy: LS_SECRET }
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("lemon-squeezy");
      expect(result.subscription?.plan).toBe("pro");
    }
  });

  it("returns 401 for an invalid signature", () => {
    const result = verifyAndParseWebhook(
      STRIPE_ACTIVATE_BODY,
      { "stripe-signature": "t=1,v1=deadbeef" },
      { stripe: STRIPE_SECRET }
    );
    expect(result).toEqual({ ok: false, status: 401, error: "Invalid Stripe signature." });
  });

  it("returns 400 when no signature header is present", () => {
    const result = verifyAndParseWebhook(STRIPE_ACTIVATE_BODY, {}, { stripe: STRIPE_SECRET });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("returns 503 when the provider secret is not configured", () => {
    const result = verifyAndParseWebhook(
      STRIPE_ACTIVATE_BODY,
      { "stripe-signature": "t=1,v1=abc" },
      {}
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(503);
  });

  it("returns 400 for a non-JSON body", () => {
    const { header } = signStripe("not json");
    const result = verifyAndParseWebhook("not json", { "stripe-signature": header }, { stripe: STRIPE_SECRET });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("acknowledges irrelevant events with a null subscription", () => {
    const body = JSON.stringify({
      provider: "stripe",
      type: "invoice.paid",
      data: { object: { id: "in_1", status: "paid" } },
    });
    const { header } = signStripe(body);
    const result = verifyAndParseWebhook(body, { "stripe-signature": header }, { stripe: STRIPE_SECRET });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.subscription).toBeNull();
  });
});
