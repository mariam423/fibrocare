import { describe, expect, it } from "vitest";
import {
  hasPermission,
  permissionsFor,
  assertPermission,
  PermissionDeniedError,
  roleFromSchemaValue,
  PRO_FEATURES,
} from "./rbac";

describe("rbac", () => {
  it("guests get no permissions", () => {
    expect(permissionsFor("guest")).toEqual([]);
    expect(hasPermission("guest", "health-data:read")).toBe(false);
  });

  it("free users can always read and write their own health data", () => {
    expect(hasPermission("free_user", "health-data:read")).toBe(true);
    expect(hasPermission("free_user", "health-data:write")).toBe(true);
    expect(hasPermission("free_user", "toolkit:use")).toBe(true);
  });

  it("free users cannot use pro features", () => {
    for (const f of PRO_FEATURES) {
      expect(hasPermission("free_user", f)).toBe(false);
    }
  });

  it("pro users get everything", () => {
    for (const f of PRO_FEATURES) {
      expect(hasPermission("pro_user", f)).toBe(true);
    }
    expect(hasPermission("pro_user", "health-data:read")).toBe(true);
  });

  it("assertPermission throws a typed error on denial", () => {
    try {
      assertPermission("free_user", "ai:companion");
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(PermissionDeniedError);
      const err = e as PermissionDeniedError;
      expect(err.permission).toBe("ai:companion");
      expect(err.role).toBe("free_user");
    }
    expect(() => assertPermission("pro_user", "ai:companion")).not.toThrow();
  });

  it("coerces unknown role values to guest", () => {
    expect(roleFromSchemaValue("hacker")).toBe("guest");
    expect(roleFromSchemaValue(null)).toBe("guest");
    expect(roleFromSchemaValue("pro_user")).toBe("pro_user");
  });
});
