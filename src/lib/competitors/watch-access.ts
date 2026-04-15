/**
 * Owner/admin checks for competitor watch settings, CSV export management actions, and CRUD.
 * Matches RLS patterns for `competitor_watch_settings` and competitor mutations.
 */

export function isBusinessOwnerOrAdmin(role: string | null | undefined): boolean {
    return role === "owner" || role === "admin";
}

export const canManageCompetitorWatchSettings = isBusinessOwnerOrAdmin;

/** Add/remove competitors (same roles as settings). */
export const canManageCompetitors = isBusinessOwnerOrAdmin;
