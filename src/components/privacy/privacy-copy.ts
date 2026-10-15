import type { ConsentCategory, Jurisdiction } from "@/lib/privacy/types";

/** Plain-English category descriptions; keep in sync with `privacy-cookies-section.tsx`. */
export const PRIVACY_CATEGORY_COPY: Record<ConsentCategory, string> = {
    essential: "Keeps you signed in, protects forms and payments, and remembers your language, theme and this choice.",
    functional: "Extras like the embedded Cal.com booking calendar and our service-status notices.",
    analytics: "Google Analytics and masked Sentry session replays, so we can see what works and fix errors faster.",
    marketing: "Meta Pixel, Google Ads tags and campaign attribution, so we can measure which ads bring sign-ups.",
};

export function jurisdictionNotice(jurisdiction: Jurisdiction): string {
    if (jurisdiction === "US") {
        return "Optional cookies are on by default where you are. Turn any category off here; we also honour Global Privacy Control as an opt-out of ad sharing. Your choice applies across all Zyene Reviews sites for six months.";
    }
    return "Optional cookies stay off until you turn them on. Your choice applies across all Zyene Reviews sites for six months, and you can change it any time from “Privacy choices” in the footer.";
}
