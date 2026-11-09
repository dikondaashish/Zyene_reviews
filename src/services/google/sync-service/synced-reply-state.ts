/** Google review sync - which reply state a synced review should keep. */

import { isZyeneOriginatedReplySource, REVIEW_RESPONSE_SOURCE_GOOGLE } from "@/lib/reviews/response-source";

/** The reply columns of the review row as it is before this sync. */
export type ExistingReplyState = {
    response_status?: string | null;
    response_source?: string | null;
    response_text?: string | null;
    responded_at?: string | null;
};

export type SyncedReplyState = {
    response_status: "pending" | "responded" | "ignored";
    response_text: string | null;
    responded_at: string | null;
    response_source: string | null;
};

/**
 * Google can take a while to list a reply we just posted. Inside this window a
 * Zyene-posted reply is trusted over Google's "no reply yet", so a sync cannot
 * flip it back to pending and let auto-reply answer the review a second time.
 */
export const ZYENE_REPLY_PROPAGATION_GRACE_MS = 30 * 60_000;

/**
 * Google is the source of truth for replies it lists. Without one:
 * - an owner's "Ignored" choice is kept (a sync used to reset it to pending);
 * - a reply Zyene posted within the grace window is kept as responded;
 * - otherwise the review is pending.
 */
export function resolveSyncedReplyState(
    googleReply: { comment?: string | null; updateTime?: string | null } | null | undefined,
    existing: ExistingReplyState | null | undefined,
    isSameReplyText: (stored: string | null | undefined, google: string) => boolean,
    now: number = Date.now(),
): SyncedReplyState {
    if (googleReply) {
        const text = googleReply.comment ?? "";
        const keepZyeneSource =
            !!existing && isZyeneOriginatedReplySource(existing.response_source)
            && isSameReplyText(existing.response_text, text);
        return {
            response_status: "responded",
            response_text: googleReply.comment || null,
            responded_at: googleReply.updateTime || null,
            response_source: keepZyeneSource ? existing!.response_source! : REVIEW_RESPONSE_SOURCE_GOOGLE,
        };
    }

    if (existing?.response_status === "ignored") {
        return { response_status: "ignored", response_text: null, responded_at: null, response_source: null };
    }

    const respondedAt = existing?.responded_at ? Date.parse(existing.responded_at) : NaN;
    if (
        existing?.response_status === "responded"
        && isZyeneOriginatedReplySource(existing.response_source)
        && Number.isFinite(respondedAt)
        && now - respondedAt < ZYENE_REPLY_PROPAGATION_GRACE_MS
    ) {
        return {
            response_status: "responded",
            response_text: existing.response_text ?? null,
            responded_at: existing.responded_at ?? null,
            response_source: existing.response_source ?? null,
        };
    }

    return { response_status: "pending", response_text: null, responded_at: null, response_source: null };
}

/** Columns to read from the existing row so `resolveSyncedReplyState` can decide. */
export const EXISTING_REPLY_STATE_COLUMNS = "content_hash, response_status, response_source, response_text, responded_at";
