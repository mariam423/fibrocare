import { verifyAndParseWebhook } from "@/lib/billing/webhook";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Best-effort user linkage from a verified billing event.
 *
 * Returns the owning FibroCare user id when the event carries one:
 *  - Stripe: `client_reference_id` (set when a checkout session is created
 *    with the user id) or `customer_email` as a fallback lookup.
 *  - Lemon Squeezy: `meta.custom_data.user_id` / `user_id` (custom fields
 *    configured on the checkout) or `attributes.user_email` fallback.
 *
 * Returns null when the event has no reference — the subscription row is
 * then stored unlinked (it still gates nothing, and an admin can link it
 * later). The checkout flow should pass the user id through so Pro
 * entitlement is enforced server-side.
 */
async function resolveEventUserId(
  rawBody: string,
  provider: "stripe" | "lemon-squeezy"
): Promise<string | null> {
  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return null;
  }

  let userId: string | null = null;
  if (provider === "stripe") {
    const ref = event?.data?.object?.client_reference_id;
    if (typeof ref === "string" && ref) userId = ref;
    if (!userId) {
      const email = event?.data?.object?.customer_email;
      if (typeof email === "string" && email) {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true },
        });
        userId = user?.id ?? null;
      }
    }
  } else {
    const custom = event?.meta?.custom_data;
    const ref =
      (typeof custom === "object" && custom !== null &&
        (custom.user_id ?? custom.userId)) ||
      null;
    if (typeof ref === "string" && ref) userId = ref;
    if (!userId) {
      const email = event?.data?.attributes?.user_email;
      if (typeof email === "string" && email) {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true },
        });
        userId = user?.id ?? null;
      }
    }
  }

  if (!userId) return null;
  // Only link to users that actually exist (never create rows for a
  // forged/unknown reference).
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Billing webhook endpoint (Stripe / Lemon Squeezy).
 *
 * The route is intentionally a thin shell — all signature verification and
 * event parsing lives in the pure, unit-tested `src/lib/billing/webhook.ts`.
 * Flow:
 *
 *   1. Read the raw body (signatures cover the exact bytes sent).
 *   2. Detect the provider from its signature header and verify the HMAC.
 *      Unverified payloads are rejected with 401 / 503 — never processed.
 *   3. Parse the event into a Subscription. Irrelevant events (e.g. Stripe
 *      `invoice.paid`) are acknowledged with 200 so the provider stops
 *      retrying without touching the database.
 *   4. Upsert the subscription by (provider, externalId) so activation and
 *      cancellation events converge on the same row.
 *
 * Configure `STRIPE_WEBHOOK_SECRET` and/or `LEMON_SQUEEZY_WEBHOOK_SECRET`
 * in `.env.local` (both can coexist — the header selects the provider).
 */
export async function POST(req: Request) {
  const rawBody = await req.text();

  const result = verifyAndParseWebhook(
    rawBody,
    {
      "stripe-signature": req.headers.get("stripe-signature") ?? undefined,
      "x-signature": req.headers.get("x-signature") ?? undefined,
    },
    {
      stripe: process.env.STRIPE_WEBHOOK_SECRET,
      lemonSqueezy: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
    }
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  // Verified but not tier-relevant — acknowledge.
  if (!result.subscription) {
    return Response.json({ received: true }, { status: 200 });
  }

  const sub = result.subscription;

  // Webhook events always carry a provider id (activation + deactivation
  // both set it), but the type allows null for the local free-plan default —
  // acknowledge defensively rather than persisting a row we can't key.
  if (!sub.externalId) {
    return Response.json({ received: true }, { status: 200 });
  }

  // Deactivation events carry the provider id (see subscriptionFromWebhook)
  // so the upsert finds the same row and moves it back to free instead of
  // leaving a stale Pro record.
  if (sub.provider === "local") {
    // "local" is the on-device fallback plan — never a real provider event.
    return Response.json({ received: true }, { status: 200 });
  }
  const userId = await resolveEventUserId(rawBody, sub.provider);
  try {
    await prisma.subscription.upsert({
      where: {
        provider_externalId: {
          provider: sub.provider,
          externalId: sub.externalId,
        },
      },
      update: {
        plan: sub.plan,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        // Link legacy rows when the event finally carries a user reference.
        ...(userId ? { userId } : {}),
      },
      create: {
        provider: sub.provider,
        externalId: sub.externalId,
        plan: sub.plan,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        ...(userId ? { userId } : {}),
      },
    });
  } catch (error) {
    console.error("Failed to persist billing webhook", error);
    // 500 tells the provider to retry; transient DB issues self-heal.
    return Response.json(
      { error: "Failed to persist subscription update." },
      { status: 500 }
    );
  }

  return Response.json({ received: true }, { status: 200 });
}
