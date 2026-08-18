/**
 * Retrieves the Google data the F5.10 audit checks score against.
 *
 * Each signal is fetched independently and failures are contained: a Media API
 * outage must not blank out the services or posts checks. A signal that fails
 * comes back `null`, which the checks render as `unavailable` rather than as a
 * failing profile.
 */
import { logger } from "@/lib/logger";
import { listAllMedia } from "@/services/google/media";
import { listAllLocalPosts } from "@/services/google/local-posts";
import type { GoogleLocationFull } from "@/services/google/listing-information";
import {
    buildLocationSignal,
    buildPhotoSignal,
    buildPostSignal,
    type GbpAuditSignals,
} from "./gbp-audit-signals";

export interface FetchGbpAuditSignalsInput {
    accessToken: string | null;
    /**
     * The v4 Media and Local Posts endpoints address a location as
     * `accounts/{accountId}/locations/{locationId}`. Connections stored before
     * the account id was captured have none, and those two signals are
     * genuinely unreadable — reported as such rather than guessed at.
     */
    accountId: string | null;
    locationId: string | null;
    /** Already-read location; the caller fetches it for the description too. */
    location: GoogleLocationFull | null;
    now?: Date;
}

const EMPTY: GbpAuditSignals = { photos: null, posts: null, location: null };

export async function fetchGbpAuditSignals(
    input: FetchGbpAuditSignalsInput
): Promise<GbpAuditSignals> {
    const { accessToken, accountId, locationId, location } = input;
    const now = input.now ?? new Date();

    const locationSignal = location ? buildLocationSignal(location) : null;

    if (!accessToken || !accountId || !locationId) {
        return { ...EMPTY, location: locationSignal };
    }

    const [mediaResult, postsResult] = await Promise.allSettled([
        listAllMedia(accessToken, accountId, locationId),
        listAllLocalPosts(accessToken, accountId, locationId),
    ]);

    if (mediaResult.status === "rejected") {
        logger.error({ err: mediaResult.reason }, "[GBP audit] media fetch failed");
    }
    if (postsResult.status === "rejected") {
        logger.error({ err: postsResult.reason }, "[GBP audit] local posts fetch failed");
    }

    return {
        photos: mediaResult.status === "fulfilled" ? buildPhotoSignal(mediaResult.value) : null,
        posts: postsResult.status === "fulfilled" ? buildPostSignal(postsResult.value, now) : null,
        location: locationSignal,
    };
}
