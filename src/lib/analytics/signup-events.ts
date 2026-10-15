type SignupEvent = "signup_started" | "signup_verification_requested" | "signup_complete";
type SignupMethod = "email" | "google";
const recorded = new Set<SignupEvent>();

/** Browser funnel signals only; no identity, form values, URLs or payment data. */
export function trackSignupEvent(event: SignupEvent, method: SignupMethod) {
    if (typeof window === "undefined" || recorded.has(event)) return;
    const flag = `zyene_${event}_tracked`;
    try {
        if (window.sessionStorage.getItem(flag)) return;
    } catch {
        // Storage restrictions must not interrupt registration.
    }
    try {
        const analytics = window as Window & { dataLayer?: Record<string, string>[] };
        analytics.dataLayer ??= [];
        analytics.dataLayer.push({ event, method });
        recorded.add(event);
        try { window.sessionStorage.setItem(flag, "1"); } catch { /* In-memory deduplication remains available. */ }
    } catch {
        // Analytics is best effort and must never change signup success.
    }
}
