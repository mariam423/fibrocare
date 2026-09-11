/**
 * Role-Based Access Control.
 *
 * Four roles, checked on both the feature level (client gating UI) and the
 * data level (server routes can call `assertPermission` before serving):
 *
 *   guest     — signed out: public content only.
 *   free_user — signed in: logging, dashboard.
 *   pro_user  — signed in + (entitlement): AI companion, toolkits,
 *               attachment-agnostic reports, predictor, consultations.
 *   doctor    — verified medical professional: publishing + consultations.
 *
 * Authorization model (see `resolveEffectiveRole` in
 * `src/lib/auth/entitlement.ts` for the authoritative resolution):
 *
 *   - doctor role is a hard DB flag and always wins.
 *   - When billing webhook secrets are configured (an ACTIVE subscription
 *     row for the user exists) → `pro_user`, otherwise `free_user`.
 *   - When billing is NOT configured, every signed-in user resolves to
 *     `pro_user` in every environment — production included. There is no
 *     payment path available in that state, so gating would only break
 *     the app; the moment billing envs are configured, enforcement
 *     becomes strict and fail-closed automatically.
 *
 * Health data itself (logs, symptoms) is never gated behind Pro: a patient
 * must always be able to read and record their own data. Pro gates only
 * value-added processing on top of it.
 */

import { z } from "zod";

export const userRoleSchema = z.enum(["guest", "free_user", "pro_user", "doctor"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const PERMISSIONS = [
  "health-data:read", // read own logs/symptoms
  "health-data:write", // record logs/symptoms
  "toolkit:use", // somatic exercises, audio, breathing
  "ai:companion", // streaming AI Care Companion
  "reports:clinical-brief", // 1-page AI clinical brief
  "reports:pdf-export", // clinical PDF export
  "predictor:time-series", // weather/flare predictor
  "video:masterclasses", // guided video masterclasses
  "doctor:publish", // publish articles and tips
  "doctor:consultation", // manage patient consultations
  "consultation:read", // read consultation threads
  "consultation:write", // send messages in consultations
  "consultation:ai-copilot", // access AI clinical copilot features
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  guest: [],
  free_user: [
    "health-data:read",
    "health-data:write",
    "toolkit:use",
  ],
  pro_user: [
    "health-data:read",
    "health-data:write",
    "toolkit:use",
    "ai:companion",
    "reports:clinical-brief",
    "reports:pdf-export",
    "predictor:time-series",
    "video:masterclasses",
    "consultation:read",
    "consultation:write",
    "consultation:ai-copilot",
  ],
  doctor: [
    "health-data:read",
    "health-data:write",
    "toolkit:use",
    "ai:companion",
    "reports:clinical-brief",
    "reports:pdf-export",
    "predictor:time-series",
    "video:masterclasses",
    "doctor:publish",
    "doctor:consultation",
    "consultation:read",
    "consultation:write",
    "consultation:ai-copilot",
  ],
};

/** The feature ids the pricing UI advertises as Pro. */
export const PRO_FEATURES: Permission[] = [
  "ai:companion",
  "reports:clinical-brief",
  "reports:pdf-export",
  "predictor:time-series",
  "video:masterclasses",
  "consultation:read",
  "consultation:write",
  "consultation:ai-copilot",
];

export function roleFromSchemaValue(raw: unknown): UserRole {
  return userRoleSchema.catch("guest").parse(raw);
}

export function permissionsFor(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[userRoleSchema.parse(role)];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Server-side guard: throws a typed error the API route can map to 403. */
export class PermissionDeniedError extends Error {
  constructor(
    public readonly permission: Permission,
    public readonly role: UserRole
  ) {
    super(`Role "${role}" is not allowed to "${permission}".`);
    this.name = "PermissionDeniedError";
  }
}

export function assertPermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new PermissionDeniedError(permission, role);
  }
}
