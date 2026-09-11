import { afterEach, describe, expect, it, vi } from "vitest";

// Prisma is only used by getEffectiveRole; the pure resolver under test
// must not touch the DB.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
  isBillingConfigured,
  resolveEffectiveRole,
} from "./entitlement";

afterEach(() => {
  vi.unstubAllEnvs();
});

const activePro = {
  plan: "pro",
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 86_400_000).toISOString(),
  provider: "stripe",
  externalId: "sub_123",
};

const canceledPro = {
  plan: "pro",
  status: "canceled",
  currentPeriodEnd: new Date(Date.now() + 86_400_000).toISOString(),
  provider: "stripe",
  externalId: "sub_123",
};

describe("isBillingConfigured", () => {
  it("is false when no webhook secret is set", () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    vi.stubEnv("LEMON_SQUEEZY_WEBHOOK_SECRET", "");
    expect(isBillingConfigured()).toBe(false);
  });

  it("is true when the Stripe webhook secret is set", () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x");
    expect(isBillingConfigured()).toBe(true);
  });

  it("is true when the Lemon Squeezy webhook secret is set", () => {
    vi.stubEnv("LEMON_SQUEEZY_WEBHOOK_SECRET", "sig_x");
    expect(isBillingConfigured()).toBe(true);
  });
});

describe("resolveEffectiveRole", () => {
  it("returns doctor regardless of subscriptions", () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x");
    expect(resolveEffectiveRole({ role: "doctor", subscriptions: [] })).toBe(
      "doctor"
    );
  });

  it("strict mode: grants pro_user only for an active Pro subscription", () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x");
    expect(
      resolveEffectiveRole({ role: "free_user", subscriptions: [activePro] })
    ).toBe("pro_user");
  });

  it("strict mode: downgrades a canceled subscription to free_user", () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x");
    expect(
      resolveEffectiveRole({ role: "free_user", subscriptions: [canceledPro] })
    ).toBe("free_user");
  });

  it("strict mode: user with no subscription rows is free_user", () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x");
    expect(resolveEffectiveRole({ role: "free_user", subscriptions: [] })).toBe(
      "free_user"
    );
  });

  it("demo mode (billing unconfigured): every signed-in user is Pro", () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    vi.stubEnv("LEMON_SQUEEZY_WEBHOOK_SECRET", "");
    expect(resolveEffectiveRole({ role: "free_user" })).toBe("pro_user");
  });

  it("production, billing unconfigured: grants Pro (no payment path exists)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    vi.stubEnv("LEMON_SQUEEZY_WEBHOOK_SECRET", "");
    expect(resolveEffectiveRole({ role: "free_user" })).toBe("pro_user");
  });

  it("production, billing configured: enforcement is strict (no subscription → free_user)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    expect(resolveEffectiveRole({ role: "free_user" })).toBe("free_user");
  });

  it("production, billing unconfigured: doctor role still resolves to doctor", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    vi.stubEnv("LEMON_SQUEEZY_WEBHOOK_SECRET", "");
    expect(resolveEffectiveRole({ role: "doctor" })).toBe("doctor");
  });

  it("production, billing configured, active subscription: pro_user", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x");
    expect(
      resolveEffectiveRole({ role: "free_user", subscriptions: [activePro] })
    ).toBe("pro_user");
  });
});
