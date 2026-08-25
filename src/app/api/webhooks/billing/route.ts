import { verifyAndParseWebhook } from "@/lib/billing/webhook";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
      },
      create: {
        provider: sub.provider,
        externalId: sub.externalId,
        plan: sub.plan,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
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
