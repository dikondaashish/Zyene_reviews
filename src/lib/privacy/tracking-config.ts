/**
 * Public tracking identifiers. Every non-essential integration is declared
 * here with its category and gated in `PrivacyScripts`; adding a tracker
 * anywhere else bypasses the PrivacyManager (see docs/PRIVACY.md).
 */

/** Google Tag Manager container. Falls back to the container already in production. */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-WF6DJZ8J";

/** Meta Pixel. Unset = no pixel at all. */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

/** Better Stack status announcement widget (functional: incident notices). */
export const BETTERSTACK_ANNOUNCEMENT_ID = "239670";

export const TRACKER_HOSTS = {
    analytics: ["www.googletagmanager.com", "www.google-analytics.com", "region1.google-analytics.com"],
    marketing: ["connect.facebook.net", "www.facebook.com", "googleads.g.doubleclick.net"],
    functional: ["uptime.betterstack.com", "cal.com", "app.cal.com"],
} as const;
