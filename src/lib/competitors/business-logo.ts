/**
 * Logo for a local business from its own website's favicon (Google's favicon
 * service). Many small businesses list a Facebook page, a booking site or a
 * free site builder as their "website"; those favicons are someone else's
 * brand, so they get initials instead of a misleading logo.
 */

const SHARED_HOSTS = [
    "facebook.com",
    "fb.com",
    "instagram.com",
    "tiktok.com",
    "x.com",
    "twitter.com",
    "linkedin.com",
    "youtube.com",
    "yelp.com",
    "tripadvisor.com",
    "google.com",
    "g.page",
    "goo.gl",
    "business.site",
    "linktr.ee",
    "wixsite.com",
    "square.site",
    "godaddysites.com",
    "weebly.com",
    "wordpress.com",
    "blogspot.com",
    "doordash.com",
    "ubereats.com",
    "grubhub.com",
    "opentable.com",
    "toasttab.com",
    "booksy.com",
    "vagaro.com",
    "fresha.com",
    "zocdoc.com",
];

/** The site's own hostname, or null when there's no site or it's a shared platform. */
export function businessLogoDomain(website: string | null | undefined): string | null {
    if (!website) return null;
    let host: string;
    try {
        host = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`).hostname.toLowerCase();
    } catch {
        return null;
    }
    host = host.replace(/^www\./, "");
    if (!host.includes(".")) return null;
    if (SHARED_HOSTS.some((shared) => host === shared || host.endsWith(`.${shared}`))) return null;
    return host;
}

export function businessLogoUrl(website: string | null | undefined): string | null {
    const domain = businessLogoDomain(website);
    return domain
        ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`
        : null;
}

/** Up to two letters for the fallback badge: "Joe's Pizza" → "JP". */
export function businessInitials(name: string): string {
    const words = name
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) return "?";
    const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
    return letters.toUpperCase();
}

/**
 * Google answers a site with no favicon with a 16px grey globe (status 404, which
 * an <img> still draws). Anything that small would also look blurry at our size.
 */
export const MIN_LOGO_PX = 17;
