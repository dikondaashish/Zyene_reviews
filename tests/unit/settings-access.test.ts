import { describe, expect, it } from "vitest";

import {
  getSettingsAccess,
  normalizeBusinessRole,
} from "../../src/lib/auth/settings-access";

describe("settings access", () => {
  it("normalizes current and legacy organization roles", () => {
    expect(normalizeBusinessRole("owner")).toBe("owner");
    expect(normalizeBusinessRole("ORG_OWNER")).toBe("owner");
    expect(normalizeBusinessRole("ORG_ADMIN")).toBe("admin");
    expect(normalizeBusinessRole("ORG_MANAGER")).toBe("manager");
    expect(normalizeBusinessRole("ORG_EMPLOYEE")).toBe("member");
    expect(normalizeBusinessRole(null)).toBeNull();
  });

  it.each([
    [
      "owner",
      {
        billing: true,
        notifications: true,
        competitorAlerts: true,
        team: true,
      },
    ],
    [
      "admin",
      {
        billing: false,
        notifications: true,
        competitorAlerts: true,
        team: true,
      },
    ],
    [
      "manager",
      {
        billing: false,
        notifications: true,
        competitorAlerts: false,
        team: true,
      },
    ],
    [
      "member",
      {
        billing: false,
        notifications: true,
        competitorAlerts: false,
        team: false,
      },
    ],
    [
      "viewer",
      {
        billing: false,
        notifications: true,
        competitorAlerts: false,
        team: false,
      },
    ],
  ] as const)("applies the least-privilege matrix for %s", (role, expected) => {
    expect(
      getSettingsAccess({ businessRole: role, organizationRole: role }),
    ).toEqual(expected);
  });

  it("uses the active organization role for billing", () => {
    expect(
      getSettingsAccess({
        businessRole: "owner",
        organizationRole: "ORG_ADMIN",
      }).billing,
    ).toBe(false);
    expect(
      getSettingsAccess({
        businessRole: "admin",
        organizationRole: "ORG_OWNER",
      }).billing,
    ).toBe(true);
  });

  it("denies business settings without an active business membership", () => {
    expect(
      getSettingsAccess({ businessRole: null, organizationRole: "ORG_OWNER" }),
    ).toEqual({
      billing: true,
      notifications: false,
      competitorAlerts: false,
      team: false,
    });
  });
});
