/**
 * Server-side entitlement resolution.
 *
 * The client (`useProFeature`) reads the subscription from localStorage —
 * that is a UX convenience only. Every Pro-gated server route must resolve
 * the effective role HERE, from data the server controls, and deny with
 * 403 when the user is not entitled. This closes the "set
 * `fibrocare-subscription` in localStorage to unlock Pro" bypass.
 *
 * Resolution order:
 *   1. `user.role === "doctor"` → doctor (verified clinician).
 *   2. Billing configured (webhook secrets present) → `pro_user` only when
 *      an ACTIVE subscription row linked to the user exists; otherwise
 *      `free_user`.
 *   3. Billing NOT configured → every signed-in user is `pro_user`, in every
 *      environment (production included). There is no payment path in this
 *      state, so gating would only break the app; the moment billing envs
 *      (webhook secrets) are configured, enforcement becomes strict and
 *      fail-closed automatically.
 */

import { prisma } from "@/lib/prisma";
import { isProActive, type Subscription } from "@/lib/billing/subscription";
import {
  assertPermission,
  hasPermission,
  type Permission,
  type UserRole,
} from "@/lib/auth/rbac";

/** True when a real billing provider is wired up (webhook secrets set). */
export function isBillingConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_WEBHOOK_SECRET || process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  );
}

/** Raw DB row shape — Prisma returns plain strings, not the zod unions. */
interface SubscriptionLike {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  provider: string;
  externalId: string | null;
}

interface EffectiveRoleInput {
  role: string | null | undefined;
  subscriptions?: SubscriptionLike[];
}

/** True only when running outside production (demo/local billing fallback). */
function isDemoEnvironment(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * Pure role resolution from DB state. Exported for unit tests.
 */
export function resolveEffectiveRole(input: EffectiveRoleInput): UserRole {
  if (input.role === "doctor") return "doctor";

  if (isBillingConfigured()) {
    const hasActivePro = (input.subscriptions ?? []).some((s) =>
      isProActive(s as Subscription)
    );
    return hasActivePro ? "pro_user" : "free_user";
  }

  // Billing not configured → every signed-in user is Pro, in every
  // environment (production included). There is no payment path in this
  // state, so gating would only break the app for every user; the moment
  // webhook secrets are configured, enforcement below becomes strict and
  // fail-closed automatically.
  return "pro_user";
}

/**
 * Resolve the effective role for a signed-in user from the database.
 * Returns `null` when the user does not exist.
 */
export async function getEffectiveRole(userId: string): Promise<UserRole | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscriptions: {
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
          provider: true,
          externalId: true,
        },
      },
    },
  });
  if (!user) return null;
  return resolveEffectiveRole(user);
}

/**
 * Server-side guard for route handlers. Returns a 403 Response when the
 * user lacks `permission`; otherwise returns null (caller proceeds).
 * `null` role (unknown user) is also denied.
 */
export async function requirePermissionResponse(
  userId: string,
  permission: Permission
): Promise<Response | null> {
  const role = await getEffectiveRole(userId);
  if (!role || !hasPermission(role, permission)) {
    return Response.json(
      { error: "This feature requires an active Pro subscription." },
      { status: 403 }
    );
  }
  return null;
}

export { assertPermission };