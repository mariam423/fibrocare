/**
 * Role-Based Access Control.
 *
 * Three roles, checked on both the feature level (client gating UI) and the
 * data level (server routes can call `assertPermission` before serving):
 *
 *   guest     — signed out: public content only.
 *   free_user — signed in: logging, dashboard, somatic toolkit, offline mode.
 *   pro_user  — signed in + active subscription: adds the AI-heavy and
 *               export features.
 *
 * Health data itself (logs, symptoms) is never gated behind Pro: a patient
 * must always be able to read and record their own data. Pro gates only
 * value-added processing on top of it.
 */

import { z } from "zod";

export const userRoleSchema = z.enum(["guest", "free_user", "pro_user"]);
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
  ],
};

/** The feature ids the pricing UI advertises as Pro. */
export const PRO_FEATURES: Permission[] = [
  "ai:companion",
  "reports:clinical-brief",
  "reports:pdf-export",
  "predictor:time-series",
  "video:masterclasses",
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
