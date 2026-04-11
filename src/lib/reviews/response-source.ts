/** Reply posted manually from the Zyene dashboard (including edits). */
export const REVIEW_RESPONSE_SOURCE_ZYENE = "zyene";

/** Reply posted by the Auto commenter (background AI job). */
export const REVIEW_RESPONSE_SOURCE_ZYENE_AUTO = "zyene_auto";

/** Synced from Google when the merchant replied on GBP (not via Zyene). */
export const REVIEW_RESPONSE_SOURCE_GOOGLE = "google";

export function isZyeneOriginatedReplySource(source: string | null | undefined): boolean {
    return source === REVIEW_RESPONSE_SOURCE_ZYENE || source === REVIEW_RESPONSE_SOURCE_ZYENE_AUTO;
}
