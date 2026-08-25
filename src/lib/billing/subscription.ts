/**
 * Subscription state manager (Stripe / Lemon Squeezy compatible).
 *
 * Provider-agnostic on purpose:
 *  - `subscriptionFromWebhook` parses checkout/webhook payloads from either
 *    provider into one internal Zod-validated shape (the only structure a
 *    webhook route needs: verify signature → parse → persist).
 *  - Local fallback: without any billing keys configured, the manager runs
 *    entirely on-device (localStorage), so the app degrades gracefully and
 *    the pricing UI still works offline.
 */

import { z } from "zod";
import type { UserRole } from "@/lib/auth/rbac";

export const subscriptionStatusSchema = z.enum([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
]);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const subscriptionSchema = z.object({
  plan: z.enum(["free", "pro"]),
  status: subscriptionStatusSchema,
  /** ISO date of the current period's end (null for the free plan). */
  currentPeriodEnd: z.string().nullable(),
  /** Which provider manages billing ("local" = on-device fallback). */
  provider: z.enum(["stripe", "lemon-squeezy", "local"]),
  /** Provider customer/subscription id (null in local mode). */
  externalId: z.string().nullable(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export const FREE_SUBSCRIPTION: Subscription = {
  plan: "free",
  status: "active",
  currentPeriodEnd: null,
  provider: "local",
  externalId: null,
};

/** Is the subscription currently unlocking Pro? (grace period included) */
export function isProActive(sub: Subscription, now = new Date()): boolean {
  if (sub.plan !== "pro") return false;
  if (sub.status === "active" || sub.status === "trialing") return true;
  // past_due keeps Pro until the paid period actually runs out.
  if (sub.status === "past_due" && sub.currentPeriodEnd) {
    return new Date(sub.currentPeriodEnd).getTime() > now.getTime();
  }
  return false;
}

/** Subscription → RBAC role. */
export function roleForSubscription(sub: Subscription, signedIn: boolean): UserRole {
  if (!signedIn) return "guest";
  return isProActive(sub) ? "pro_user" : "free_user";
}

/* ------------------------------------------------------------------ */
/* Webhook parsing                                                     */
/* ------------------------------------------------------------------ */

/**
 * Normalized webhook event. Both providers are mapped onto this shape by
 * `subscriptionFromWebhook` below; webhook routes only ever see this.
 */
export const webhookEventSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("stripe"),
    type: z.string(),
    data: z.object({
      object: z.object({
        id: z.string(),
        customer: z.string().nullable().optional(),
        status: subscriptionStatusSchema,
        current_period_end: z.number().nullable().optional(),
        items: z
          .object({
            data: z.array(
              z.object({
                price: z.object({ recurring: z.object({ interval: z.string() }).nullable() }).nullable(),
              })
            ),
          })
          .optional(),
      }),
    }),
  }),
  z.object({
    provider: z.literal("lemon-squeezy"),
    meta: z.object({
      event_name: z.string(),
    }),
    data: z.object({
      id: z.string(),
      attributes: z.object({
        status: subscriptionStatusSchema,
        renews_at: z.string().nullable().optional(),
        customer_id: z.number().nullable().optional(),
      }),
    }),
  }),
]);

export type WebhookEvent = z.infer<typeof webhookEventSchema>;

/** Events that activate a Pro subscription. */
const ACTIVATE_EVENTS = new Set([
  "stripe:checkout.session.completed",
  "stripe:customer.subscription.created",
  "stripe:customer.subscription.updated",
  "lemon-squeezy:subscription_created",
  "lemon-squeezy:subscription_updated",
  "lemon-squeezy:order_created",
]);

const DEACTIVATE_EVENTS = new Set([
  "stripe:customer.subscription.deleted",
  "lemon-squeezy:subscription_cancelled",
  "lemon-squeezy:subscription_expired",
]);

/**
 * Parse a provider webhook body into a Subscription. Returns null for
 * irrelevant events so the webhook route can acknowledge and skip them.
 */
export function subscriptionFromWebhook(raw: unknown): Subscription | null {
  let event: WebhookEvent;
  try {
    event = webhookEventSchema.parse(raw);
  } catch {
    return null;
  }

  const kind =
    event.provider === "stripe"
      ? `stripe:${event.type}`
      : `lemon-squeezy:${event.meta.event_name}`;

  if (DEACTIVATE_EVENTS.has(kind)) {
    // Keep the provider id so the webhook store can upsert the same row
    // back to the free plan instead of leaving a stale Pro record behind.
    return {
      ...FREE_SUBSCRIPTION,
      provider: event.provider,
      externalId:
        event.provider === "stripe"
          ? event.data.object.id
          : event.data.id,
    };
  }
  if (!ACTIVATE_EVENTS.has(kind)) return null;

  if (event.provider === "stripe") {
    const obj = event.data.object;
    return subscriptionSchema.parse({
      plan: "pro",
      status: obj.status,
      currentPeriodEnd: obj.current_period_end
        ? new Date(obj.current_period_end * 1000).toISOString()
        : null,
      provider: "stripe",
      externalId: obj.id,
    });
  }

  return subscriptionSchema.parse({
    plan: "pro",
    status: event.data.attributes.status,
    currentPeriodEnd: event.data.attributes.renews_at ?? null,
    provider: "lemon-squeezy",
    externalId: event.data.id,
  });
}

/* ------------------------------------------------------------------ */
/* Local (offline) fallback store                                      */
/* ------------------------------------------------------------------ */

const LOCAL_KEY = "fibrocare-subscription";

export interface SubscriptionStore {
  load(): Subscription | null;
  save(sub: Subscription): void;
}

/** localStorage-backed store; falls back to no-op on the server. */
export function localSubscriptionStore(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = typeof localStorage !== "undefined" ? localStorage : undefined as unknown as Storage
): SubscriptionStore {
  return {
    load() {
      try {
        const raw = storage.getItem(LOCAL_KEY);
        return raw ? subscriptionSchema.parse(JSON.parse(raw)) : null;
      } catch {
        return null;
      }
    },
    save(sub) {
      storage.setItem(LOCAL_KEY, JSON.stringify(subscriptionSchema.parse(sub)));
    },
  };
}

/** Resolve the effective subscription: local store → free default. */
export function loadSubscription(): Subscription {
  if (typeof window === "undefined") return FREE_SUBSCRIPTION;
  return localSubscriptionStore().load() ?? FREE_SUBSCRIPTION;
}
