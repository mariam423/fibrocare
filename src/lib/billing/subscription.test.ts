import { describe, expect, it } from "vitest";
import {
  FREE_SUBSCRIPTION,
  isProActive,
  roleForSubscription,
  subscriptionFromWebhook,
  localSubscriptionStore,
  type Subscription,
} from "./subscription";

function pro(overrides: Partial<Subscription> = {}): Subscription {
  return {
    plan: "pro",
    status: "active",
    currentPeriodEnd: "2027-01-01T00:00:00.000Z",
    provider: "stripe",
    externalId: "sub_123",
    ...overrides,
  };
}

describe("isProActive", () => {
  it("active and trialing pro subscriptions unlock Pro", () => {
    expect(isProActive(pro())).toBe(true);
    expect(isProActive(pro({ status: "trialing" }))).toBe(true);
  });

  it("free plan never unlocks Pro", () => {
    expect(isProActive(FREE_SUBSCRIPTION)).toBe(false);
  });

  it("past_due keeps Pro until the paid period ends (grace period)", () => {
    expect(isProActive(pro({ status: "past_due" }))).toBe(true);
    const expired = pro({
      status: "past_due",
      currentPeriodEnd: "2020-01-01T00:00:00.000Z",
    });
    expect(isProActive(expired)).toBe(false);
  });

  it("canceled and incomplete do not unlock", () => {
    expect(isProActive(pro({ status: "canceled" }))).toBe(false);
    expect(isProActive(pro({ status: "incomplete" }))).toBe(false);
  });
});

describe("roleForSubscription", () => {
  it("maps to the RBAC roles", () => {
    expect(roleForSubscription(FREE_SUBSCRIPTION, true)).toBe("free_user");
    expect(roleForSubscription(pro(), true)).toBe("pro_user");
    expect(roleForSubscription(pro(), false)).toBe("guest");
    expect(roleForSubscription(FREE_SUBSCRIPTION, false)).toBe("guest");
  });
});

describe("subscriptionFromWebhook", () => {
  it("parses a Stripe checkout completion into an active Pro subscription", () => {
    const sub = subscriptionFromWebhook({
      provider: "stripe",
      type: "checkout.session.completed",
      data: { object: { id: "cs_1", status: "active", current_period_end: 1798761600 } },
    });
    expect(sub?.plan).toBe("pro");
    expect(sub?.status).toBe("active");
    expect(sub?.provider).toBe("stripe");
    expect(sub?.externalId).toBe("cs_1");
    expect(sub?.currentPeriodEnd).toBe("2027-01-01T00:00:00.000Z");
  });

  it("parses a Lemon Squeezy subscription_created event", () => {
    const sub = subscriptionFromWebhook({
      provider: "lemon-squeezy",
      meta: { event_name: "subscription_created" },
      data: {
        id: "ls_9",
        attributes: { status: "active", renews_at: "2027-06-01T00:00:00.000Z" },
      },
    });
    expect(sub?.plan).toBe("pro");
    expect(sub?.provider).toBe("lemon-squeezy");
    expect(sub?.externalId).toBe("ls_9");
  });

  it("cancellation events return to the free plan and keep the provider id", () => {
    const sub = subscriptionFromWebhook({
      provider: "stripe",
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_1", status: "canceled" } },
    });
    expect(sub?.plan).toBe("free");
    // The id must survive so the webhook store can upsert the same row.
    expect(sub?.externalId).toBe("sub_1");
    expect(sub?.provider).toBe("stripe");
  });

  it("lemon-squeezy cancellation keeps its id too", () => {
    const sub = subscriptionFromWebhook({
      provider: "lemon-squeezy",
      meta: { event_name: "subscription_cancelled" },
      data: { id: "ls_9", attributes: { status: "canceled" } },
    });
    expect(sub?.plan).toBe("free");
    expect(sub?.externalId).toBe("ls_9");
  });

  it("returns null for irrelevant and malformed events", () => {
    expect(subscriptionFromWebhook({ provider: "stripe", type: "ping" })).toBeNull();
    expect(subscriptionFromWebhook({ garbage: true })).toBeNull();
    expect(subscriptionFromWebhook(null)).toBeNull();
  });
});

describe("localSubscriptionStore", () => {
  function memoryStorage() {
    const data = new Map<string, string>();
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => data.set(k, v),
      removeItem: (k: string) => data.delete(k),
    };
  }

  it("round-trips a subscription and validates on load", () => {
    const store = localSubscriptionStore(memoryStorage());
    store.save(pro());
    expect(store.load()).toEqual(pro());
  });

  it("returns null for corrupted entries", () => {
    const storage = memoryStorage();
    storage.setItem("fibrocare-subscription", "{not json");
    expect(localSubscriptionStore(storage).load()).toBeNull();
  });
});
