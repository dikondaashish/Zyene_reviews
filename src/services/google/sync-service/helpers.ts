/** Google review sync — helpers */

import { createAdminClient } from "@/lib/db/supabase/admin";
import type { Json } from "@/lib/db/supabase/database.types";
import type { GoogleReview } from "../business-profile";

export type SyncError = Error & { code?: "RATE_LIMIT" | "CONFLICT" };
export type AdminClient = ReturnType<typeof createAdminClient>;
export type ReviewPlatformRef = { id: string; business_id: string };

export function syncStateObject(syncState: unknown): Record<string, unknown> {
    if (syncState && typeof syncState === "object" && !Array.isArray(syncState)) return syncState as Record<string, unknown>;
    return {};
}

export async function clearForceFullSyncFlag(platformId: string): Promise<void> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("review_platforms")
        .select("sync_state")
        .eq("id", platformId)
        .maybeSingle();
    const obj = syncStateObject(data?.sync_state);
    if (!("force_full_sync" in obj)) return;
    const { force_full_sync: _ignored, ...rest } = obj as Record<string, unknown>;
    await admin.from("review_platforms").update({ sync_state: rest as Json }).eq("id", platformId);
}

export function createSyncError(message: string, code: "RATE_LIMIT" | "CONFLICT"): SyncError {
    const error = new Error(message) as SyncError;
    error.code = code;
    return error;
}

export function reviewerAvatarFromGoogle(reviewer: GoogleReview["reviewer"]): string | null {
    const url = reviewer.profilePhotoUrl || reviewer.profilePhotoUri;
    return url && url.trim() ? url.trim() : null;
}

function cleanStringArray(values: Array<string | null | undefined>): string[] | null {
    const cleaned = values
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v.length > 0);
    return cleaned.length > 0 ? Array.from(new Set(cleaned)) : null;
}

export function googleReviewPhotoUrls(review: GoogleReview): string[] | null {
    const fromObjects = (review.photos || []).flatMap((p) => [p.photoUri, p.photoUrl, p.url]);
    const fromArray = review.photoUrls || [];
    return cleanStringArray([...fromObjects, ...fromArray]);
}

export function googleAttributeChips(review: GoogleReview): string[] | null {
    const raw = review as unknown as Record<string, unknown>;
    const reviewQuestions = Array.isArray(review.reviewQuestions)
        ? review.reviewQuestions.map((q) => q.displayName || q.question || q.answer || q.rating || "")
        : [];
    const detailsObj = raw.details && typeof raw.details === "object" ? (raw.details as Record<string, unknown>) : {};
    const detailEntries = Object.entries(detailsObj).flatMap(([k, v]) => {
        if (typeof v === "string" && v.trim()) return [`${k}: ${v.trim()}`];
        if (typeof v === "number" || typeof v === "boolean") return [`${k}: ${String(v)}`];
        return [];
    });
    return cleanStringArray([...reviewQuestions, ...detailEntries]);
}

export function googlePlaceContext(review: GoogleReview): string[] | null {
    const raw = review as unknown as Record<string, unknown>;
    const maybeStrings = [
        review.tripType,
        review.mealType,
        review.priceRange,
        typeof raw.serviceType === "string" ? raw.serviceType : undefined,
        typeof raw.seatingType === "string" ? raw.seatingType : undefined,
    ];
    const stayDate =
        review.stayDate?.year && review.stayDate?.month
            ? `${review.stayDate.year}-${String(review.stayDate.month).padStart(2, "0")}`
            : undefined;
    return cleanStringArray([...maybeStrings, stayDate]);
}

export function sameReviewReplyText(a: string | null | undefined, b: string | null | undefined): boolean {
    return (a ?? "").trim() === (b ?? "").trim();
}

export function isOrderByUnsupportedError(error: unknown): boolean {
    const msg = error instanceof Error ? error.message : String(error);
    return (
        /Failed to list reviews:\s*400/i.test(msg) ||
        /INVALID_ARGUMENT/i.test(msg) ||
        /orderBy/i.test(msg)
    );
}

