"use client";

/**
 * Feature-gating hook: resolves the user's role from their subscription and
 * answers `canUse(feature)` plus a ready-to-render Pro preview state.
 *
 * Server-side routes should use `assertPermission` from `@/lib/auth/rbac`
 * directly; this hook powers the client UX (preview banner + pricing modal)
 * and is intentionally forgiving — when nothing is stored, everything falls
 * back to the free tier, never to a broken state.
 */

import { useCallback, useEffect, useState } from "react";
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

export function useProFeature(signedIn = true): ProFeatureState {
  const [subscription, setSubscription] = useState<Subscription>(FREE_SUBSCRIPTION);

  useEffect(() => {
    setSubscription(loadSubscription());
  }, []);

  const isPro = isProActive(subscription);
  const role: UserRole = !signedIn ? "guest" : isPro ? "pro_user" : "free_user";

  const canUse = useCallback(
    (feature: Permission) => hasPermission(role, feature),
    [role]
  );
  const isProFeature = useCallback((feature: Permission) => PRO_SET.has(feature), []);

  return { role, isPro, canUse, isProFeature, subscription };
}
