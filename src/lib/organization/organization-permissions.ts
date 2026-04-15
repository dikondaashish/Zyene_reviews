/** True when `organization_members.role` is the sole org-level owner (not admin/manager). */
export function isOrganizationOwnerRole(role: string | null | undefined): boolean {
    const r = String(role ?? "").trim().toLowerCase();
    return r === "owner" || r === "org_owner";
}
