import type { CompetitorSnapshot } from "./competitors-types";

export function getCompetitorSourceLabel(
    snap: CompetitorSnapshot | undefined
): string {
    const meta = snap?.metadata as
        | { provider?: string; seeded_on_create?: boolean }
        | null
        | undefined;
    if (meta?.provider) return String(meta.provider);
    if (snap?.source === "google_places") return "google_places";
    if (snap?.source === "manual" && meta?.seeded_on_create) return "Pending sync";
    return snap?.source || "—";
}
