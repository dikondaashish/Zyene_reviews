import type { CompetitorSnapshot } from "./competitors-types";

/** Where the numbers came from, in words an owner recognises (never raw provider codes). */
export function getCompetitorSourceLabel(
    snap: CompetitorSnapshot | undefined
): string {
    const meta = snap?.metadata as
        | { provider?: string; seeded_on_create?: boolean }
        | null
        | undefined;
    const raw = String(meta?.provider || snap?.source || "").toLowerCase();
    if (snap?.source === "manual" && meta?.seeded_on_create) return "Waiting for the first update";
    if (raw.includes("google") || raw === "cron") return "From Google";
    if (raw === "manual") return "Added by you";
    if (raw.includes("fallback")) return "Last saved numbers";
    return "Not updated yet";
}
