import { createAdminClient } from "@/lib/db/supabase/admin";
import { syncGbpQuestionsForPlatform } from "./phase2-sync";

function tryLocationFromQuestionName(name: unknown): string | null {
    if (typeof name !== "string") return null;
    const m = name.match(/^locations\/([^/]+)\//);
    return m ? m[1] : null;
}

/**
 * Best-effort parse of Pub/Sub JSON for NEW_QUESTION / NEW_ANSWER style notifications.
 */
export function extractGoogleLocationIdFromQaPayload(payload: Record<string, unknown>): string | null {
    const blocks: Array<Record<string, unknown>> = [];
    const nq = payload.new_question;
    const uq = payload.updated_question;
    if (nq && typeof nq === "object") blocks.push(nq as Record<string, unknown>);
    if (uq && typeof uq === "object") blocks.push(uq as Record<string, unknown>);

    for (const block of blocks) {
        if (typeof block.locationName === "string") {
            const parts = block.locationName.split("/").filter(Boolean);
            const idx = parts.lastIndexOf("locations");
            if (idx >= 0 && parts[idx + 1]) {
                return parts[idx + 1];
            }
        }
        const fromQ = tryLocationFromQuestionName(block.questionName);
        if (fromQ) return fromQ;
    }

    const na = (payload.new_answer || payload.updated_answer) as Record<string, unknown> | undefined;
    if (na && typeof na === "object") {
        const fromA = tryLocationFromQuestionName((na as { questionName?: string }).questionName);
        if (fromA) return fromA;
    }

    if (typeof payload.location === "string") {
        const m = payload.location.match(/locations\/([^/]+)/);
        if (m) return m[1];
    }

    if (typeof payload.question === "string") {
        const fromQ = tryLocationFromQuestionName(payload.question);
        if (fromQ) return fromQ;
    }

    return null;
}

export async function processQaWebhookForLocation(googleLocationId: string): Promise<void> {
    const admin = createAdminClient();
    const { data: platform, error } = await admin
        .from("review_platforms")
        .select("id")
        .eq("platform", "google")
        .eq("google_location_id", googleLocationId)
        .maybeSingle();

    if (error || !platform) {
        console.warn("[GBP Webhook] Q&A: no platform for location", googleLocationId);
        return;
    }

    await syncGbpQuestionsForPlatform(platform.id);
}
