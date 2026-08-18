/**
 * Shapes raw Google Business Profile API payloads into the inputs the F5.10
 * audit checks score against.
 *
 * Every field here comes from a real API response. A signal this module cannot
 * retrieve is `null`, never a zero — "Google did not answer" and "the business
 * has none" are different findings, and collapsing them would report a healthy
 * profile as empty during an outage.
 */
import type { GoogleMediaItem } from "@/services/google/media";
import { PUBLISHED_POST_STATES, type GoogleLocalPost } from "@/services/google/local-posts";
import type { GoogleServiceArea, GoogleServiceItem } from "@/services/google/listing-information";
import { POST_WINDOW_DAYS } from "./gbp-audit-thresholds";

export interface GbpPhotoSignal {
    /** Photos the merchant uploaded. Customer-contributed media is excluded. */
    ownerPhotoCount: number;
    /** Every photo and video Google reports for the location. */
    totalMediaCount: number;
    /** ISO timestamp of the newest owner photo, or null if there are none. */
    latestOwnerPhotoAt: string | null;
    /** True when paging stopped early, so counts are a floor, not a total. */
    truncated: boolean;
}

export interface GbpPostSignal {
    /** Published posts created inside the lookback window, newest first. */
    recentSummaries: string[];
    recentCount: number;
    windowDays: number;
}

export interface GbpLocationSignal {
    serviceItems: GoogleServiceItem[];
    serviceArea: GoogleServiceArea | null;
}

export interface GbpAuditSignals {
    photos: GbpPhotoSignal | null;
    posts: GbpPostSignal | null;
    location: GbpLocationSignal | null;
}

/** A media item with no `attribution` block is an owner upload. */
function isOwnerPhoto(item: GoogleMediaItem): boolean {
    return item.mediaFormat === "PHOTO" && !item.attribution;
}

function parseTimestamp(value: string | undefined): number | null {
    if (!value) return null;
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? null : ms;
}

export function buildPhotoSignal(media: {
    items: GoogleMediaItem[];
    totalMediaItemCount: number;
    truncated: boolean;
}): GbpPhotoSignal {
    const ownerPhotos = media.items.filter(isOwnerPhoto);

    let latestMs: number | null = null;
    let latestIso: string | null = null;
    for (const photo of ownerPhotos) {
        const ms = parseTimestamp(photo.createTime);
        if (ms !== null && (latestMs === null || ms > latestMs)) {
            latestMs = ms;
            latestIso = photo.createTime ?? null;
        }
    }

    return {
        ownerPhotoCount: ownerPhotos.length,
        totalMediaCount: media.totalMediaItemCount,
        latestOwnerPhotoAt: latestIso,
        truncated: media.truncated,
    };
}

export function buildPostSignal(
    posts: GoogleLocalPost[],
    now: Date,
    windowDays: number = POST_WINDOW_DAYS
): GbpPostSignal {
    const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000;

    const recent = posts
        .filter((post) => {
            if (!PUBLISHED_POST_STATES.has(post.state ?? "")) return false;
            const created = parseTimestamp(post.createTime);
            return created !== null && created >= cutoff;
        })
        .sort((a, b) => (parseTimestamp(b.createTime) ?? 0) - (parseTimestamp(a.createTime) ?? 0));

    return {
        recentSummaries: recent.map((post) => post.summary ?? ""),
        recentCount: recent.length,
        windowDays,
    };
}

/** Pulls the audit-relevant fields off a Business Information location read. */
export function buildLocationSignal(location: {
    serviceItems?: GoogleServiceItem[];
    serviceArea?: GoogleServiceArea;
}): GbpLocationSignal {
    return {
        serviceItems: location.serviceItems ?? [],
        serviceArea: location.serviceArea ?? null,
    };
}

/** The description a service item carries, wherever the union stores it. */
export function serviceDescription(item: GoogleServiceItem): string {
    return (
        item.structuredServiceItem?.description ??
        item.freeFormServiceItem?.label?.description ??
        ""
    ).trim();
}

/** The display name a service item carries, if it is a free-form entry. */
export function serviceDisplayName(item: GoogleServiceItem): string {
    return (item.freeFormServiceItem?.label?.displayName ?? "").trim();
}
