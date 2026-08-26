"use client";

/**
 * Feature-gating hook: resolves the user's role from their subscription and
 * DB role, then answers `canUse(feature)` plus a ready-to-render Pro preview
 * state.
 *
 * Server-side routes should use `assertPermission` from `@/lib/auth/rbac`
 * directly; this hook powers the client UX (preview banner + pricing modal)
 * and is intentionally forgiving — when nothing is stored, everything falls
 * back to the free tier, never to a broken state.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  FREE_SUBSCRIPTION,
  isProActive,
  loadSubscription,
  type Subscription,
} from "@/lib/billing/subscription";
import {
  hasPermission,
  PRO_FEATURES,
  type Permission,
  type UserRole,
} from "@/lib/auth/rbac";
import { getUserRole } from "@/app/pro/actions";

export interface ProFeatureState {
  role: UserRole;
  isPro: boolean;
  /** True when the feature is unlocked for this user. */
  canUse: (feature: Permission) => boolean;
  /** True when the feature is a Pro feature (for preview banners). */
  isProFeature: (feature: Permission) => boolean;
  /** Subscription snapshot (free default when nothing stored). */
  subscription: Subscription;
}

const PRO_SET = new Set<Permission>(PRO_FEATURES);

/* The subscription is resolved once (mirroring the old read-on-mount effect)
   and cached so useSyncExternalStore always gets a stable snapshot — a fresh
   object per read would trip its "cached snapshot" guard. Nothing in the
   client writes the store mid-session (only webhook/server paths do), so a
   single read is behaviorally identical. The server snapshot is the free
   default, so hydration never mismatches; the stored value flips in after. */
const emptySubscribe = () => () => {};
let subscriptionSnapshot: Subscription | null = null;
const readSubscription = (): Subscription => {
  subscriptionSnapshot ??= loadSubscription();
  return subscriptionSnapshot;
};

/**
 * Resolve the effective client-side role. The subscription store can only
 * produce `guest | free_user | pro_user`, so we also fetch the DB role
 * once on mount to pick up `"doctor"`. The DB role wins when it's
 * `"doctor"` because no subscription state can produce that value.
 */
function resolveRole(
  signedIn: boolean,
  subscription: Subscription,
  dbRole: UserRole | null
): UserRole {
  if (!signedIn) return "guest";
  if (dbRole === "doctor") return "doctor";
  return isProActive(subscription) ? "pro_user" : "free_user";
}

export function useProFeature(signedIn = true): ProFeatureState {
  const subscription = useSyncExternalStore(
    emptySubscribe,
    readSubscription,
    () => FREE_SUBSCRIPTION
  );

  const [dbRole, setDbRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    getUserRole().then((result) => {
      if (result.success) setDbRole(result.role);
    });
  }, [signedIn]);

  const isPro = isProActive(subscription);
  const role = resolveRole(signedIn, subscription, dbRole);

  const canUse = useCallback(
    (feature: Permission) => hasPermission(role, feature),
    [role]
  );
  const isProFeature = useCallback((feature: Permission) => PRO_SET.has(feature), []);

  return { role, isPro, canUse, isProFeature, subscription };
}
