/**
 * The six Google Business Profile audit checks of F5.10 — five that shipped as
 * `pending` stubs, plus `services-list`, which shipped scored from a proxy
 * (`actionLinkCount >= 25`) and is replaced here with the merchant's real
 * Google services.
 *
 * Pure functions over the signals in `gbp-audit-signals.ts`. Every verdict is
 * derived from a field Google actually returned; a signal we could not fetch
 * yields `unavailable`, and a check that does not apply to this business yields
 * `not-applicable`. Neither counts toward the score — inventing a `fail` from
 * missing data is the failure mode this module is written to avoid.
 */
import type { GbpAuditSignals } from "./gbp-audit-signals";
import { serviceDescription } from "./gbp-audit-signals";
import {
    MIN_OWNER_PHOTOS,
    MIN_POSTS_IN_WINDOW,
    MIN_POST_KEYWORD_RATIO,
    MIN_SERVICES,
    MIN_SERVICE_DESCRIPTION_RATIO,
    PHOTO_RECENCY_DAYS,
} from "./gbp-audit-thresholds";

export type GbpCheckStatus = "pass" | "fail" | "unavailable" | "not-applicable";

export interface GbpCheckResult {
    id: string;
    label: string;
    status: GbpCheckStatus;
    detail: string;
}

const UNAVAILABLE_DETAIL = "Could not read this from Google on the last load.";

function daysSince(iso: string, now: Date): number {
    return Math.floor((now.getTime() - Date.parse(iso)) / (24 * 60 * 60 * 1000));
}

function checkImages(signals: GbpAuditSignals, now: Date): GbpCheckResult {
    const base = { id: "images", label: "Photos" };
    const photos = signals.photos;
    if (!photos) return { ...base, status: "unavailable", detail: UNAVAILABLE_DETAIL };

    const countOk = photos.ownerPhotoCount >= MIN_OWNER_PHOTOS;
    const ageDays = photos.latestOwnerPhotoAt ? daysSince(photos.latestOwnerPhotoAt, now) : null;
    const recencyOk = ageDays !== null && ageDays <= PHOTO_RECENCY_DAYS;

    const countText = `${photos.ownerPhotoCount} owner photo${photos.ownerPhotoCount === 1 ? "" : "s"}`;
    const totalText = `${photos.totalMediaCount} media items on the profile in total`;
    const recencyText =
        ageDays === null
            ? "none carry a date we can read"
            : `newest added ${ageDays} day${ageDays === 1 ? "" : "s"} ago`;

    if (countOk && recencyOk) {
        return { ...base, status: "pass", detail: `${countText} (${recencyText}); ${totalText}.` };
    }

    const gaps: string[] = [];
    if (!countOk) gaps.push(`target is ${MIN_OWNER_PHOTOS}+`);
    if (!recencyOk) gaps.push(`add one within the last ${PHOTO_RECENCY_DAYS} days`);
    return {
        ...base,
        status: "fail",
        detail: `${countText} (${recencyText}); ${totalText}. Needed: ${gaps.join("; ")}.`,
    };
}

function checkPostFrequency(signals: GbpAuditSignals): GbpCheckResult {
    const base = { id: "post-frequency", label: "Post Frequency" };
    const posts = signals.posts;
    if (!posts) return { ...base, status: "unavailable", detail: UNAVAILABLE_DETAIL };

    const ok = posts.recentCount >= MIN_POSTS_IN_WINDOW;
    const detail = `${posts.recentCount} published post${
        posts.recentCount === 1 ? "" : "s"
    } in the last ${posts.windowDays} days. Target: ${MIN_POSTS_IN_WINDOW}+.`;
    return { ...base, status: ok ? "pass" : "fail", detail };
}

function checkPostKeywords(signals: GbpAuditSignals, keywords: string[]): GbpCheckResult {
    const base = { id: "post-keywords", label: "Post Keyword Optimization" };
    const posts = signals.posts;
    if (!posts) return { ...base, status: "unavailable", detail: UNAVAILABLE_DETAIL };

    if (posts.recentCount === 0) {
        return {
            ...base,
            status: "not-applicable",
            detail: `No published posts in the last ${posts.windowDays} days to analyse — see Post Frequency.`,
        };
    }
    if (keywords.length === 0) {
        return {
            ...base,
            status: "unavailable",
            detail: "No tracked search keywords available to check posts against.",
        };
    }

    const lowered = keywords.map((k) => k.toLowerCase());
    const matching = posts.recentSummaries.filter((summary) => {
        const text = summary.toLowerCase();
        return lowered.some((keyword) => text.includes(keyword));
    }).length;

    const ratio = matching / posts.recentCount;
    const detail = `${matching} of ${posts.recentCount} recent posts mention a tracked keyword. Target: ${Math.round(
        MIN_POST_KEYWORD_RATIO * 100
    )}%.`;
    return { ...base, status: ratio >= MIN_POST_KEYWORD_RATIO ? "pass" : "fail", detail };
}

function checkServicesList(signals: GbpAuditSignals): GbpCheckResult {
    const base = { id: "services-list", label: "Services Listed" };
    const location = signals.location;
    if (!location) return { ...base, status: "unavailable", detail: UNAVAILABLE_DETAIL };

    const count = location.serviceItems.length;
    const detail = `${count} service${count === 1 ? "" : "s"} listed on your Google Business Profile. Target: ${MIN_SERVICES}+.`;
    return { ...base, status: count >= MIN_SERVICES ? "pass" : "fail", detail };
}

function checkServiceDescriptions(signals: GbpAuditSignals): GbpCheckResult {
    const base = { id: "service-descriptions", label: "Service Descriptions" };
    const location = signals.location;
    if (!location) return { ...base, status: "unavailable", detail: UNAVAILABLE_DETAIL };

    const total = location.serviceItems.length;
    if (total === 0) {
        return {
            ...base,
            status: "not-applicable",
            detail: "No services listed yet — see Services Listed.",
        };
    }

    const described = location.serviceItems.filter((item) => serviceDescription(item).length > 0).length;
    const ratio = described / total;
    const detail = `${described} of ${total} services have a description. Target: ${Math.round(
        MIN_SERVICE_DESCRIPTION_RATIO * 100
    )}%.`;
    return { ...base, status: ratio >= MIN_SERVICE_DESCRIPTION_RATIO ? "pass" : "fail", detail };
}

/**
 * Google's v1 API models a service area as up to 20 place ids, not a radius —
 * the radius-based model the PRD's wording assumes does not exist on this API,
 * so this measures declared coverage areas instead.
 */
function checkServiceArea(signals: GbpAuditSignals): GbpCheckResult {
    const base = { id: "service-area", label: "Service Area" };
    const location = signals.location;
    if (!location) return { ...base, status: "unavailable", detail: UNAVAILABLE_DETAIL };

    const area = location.serviceArea;
    const type = area?.businessType;
    const servesCustomerLocations =
        type === "CUSTOMER_LOCATION_ONLY" || type === "CUSTOMER_AND_BUSINESS_LOCATION";

    if (!servesCustomerLocations) {
        return {
            ...base,
            status: "not-applicable",
            detail: "Google has this listed as a storefront that does not travel to customers.",
        };
    }

    const areaCount = area?.places?.placeInfos?.length ?? 0;
    const detail = `${areaCount} service area${areaCount === 1 ? "" : "s"} declared for a business that serves customers on site.`;
    return {
        ...base,
        status: areaCount > 0 ? "pass" : "fail",
        detail: areaCount > 0 ? detail : `${detail} Add the areas you cover so you can rank in them.`,
    };
}

export function buildGbpAuditChecks(
    signals: GbpAuditSignals,
    options: { keywords: string[]; now?: Date }
): GbpCheckResult[] {
    const now = options.now ?? new Date();
    return [
        checkImages(signals, now),
        checkPostFrequency(signals),
        checkPostKeywords(signals, options.keywords),
        checkServicesList(signals),
        checkServiceDescriptions(signals),
        checkServiceArea(signals),
    ];
}
