export type NormalizedBusinessRole =
  | "owner"
  | "admin"
  | "manager"
  | "member"
  | "viewer";

export type SettingsAccess = {
  billing: boolean;
  notifications: boolean;
  competitorAlerts: boolean;
  team: boolean;
};

export function normalizeBusinessRole(
  role: string | null | undefined,
): NormalizedBusinessRole | null {
  const normalized = String(role ?? "")
    .trim()
    .toLowerCase();
  switch (normalized) {
    case "owner":
    case "org_owner":
      return "owner";
    case "admin":
    case "org_admin":
      return "admin";
    case "manager":
    case "org_manager":
      return "manager";
    case "member":
    case "org_employee":
      return "member";
    case "viewer":
      return "viewer";
    default:
      return null;
  }
}

/** One least-privilege policy used by settings navigation and direct routes. */
export function getSettingsAccess(input: {
  businessRole: string | null | undefined;
  organizationRole: string | null | undefined;
}): SettingsAccess {
  const businessRole = normalizeBusinessRole(input.businessRole);
  const organizationRole = normalizeBusinessRole(input.organizationRole);

  return {
    billing: organizationRole === "owner",
    notifications: businessRole !== null,
    competitorAlerts: businessRole === "owner" || businessRole === "admin",
    team:
      businessRole === "owner" ||
      businessRole === "admin" ||
      businessRole === "manager",
  };
}
