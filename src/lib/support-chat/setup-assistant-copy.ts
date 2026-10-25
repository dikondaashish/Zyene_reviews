/** Client-safe copy for the in-app setup assistant (the prompt itself stays server-side). */

export const SETUP_ASSISTANT_NAME = "Zyene AI";
export const SUPPORT_EMAIL_ADDRESS = "support@zyenereviews.com";

/** What each onboarding screen asks for, keyed by `users.onboarding_step`, so answers match the screen. */
export const SETUP_STEP_GUIDE: Record<number, { name: string; about: string }> = {
    1: { name: "About you", about: "Google sign-ups add a mobile number (required, with country code). Text alerts for new reviews are optional. They say whether they run a business or an agency." },
    2: { name: "Connect", about: "Connect the Google Business Profile (recommended: imports reviews and lets Zyene draft replies), or find the business by name (Google fills in the address, city, state and country), or type every field. \"I'll do this later\" skips it; Google can be connected later in Settings, Integrations." },
    3: { name: "Industry", about: "Pick the industry tile so templates and reply suggestions fit. The support email is where customer replies to review-request emails go; both can be changed later in Settings, Business Info. They can also edit their review link (collectratings.com/their-name), checked for availability as they type; the link, logo, colours and review page wording can all be changed later in Settings, Public profile." },
    6: { name: "Your results", about: "Shows the business's real Google rating, review count, reviews with no reply and unhappy reviews with no reply. The first import usually takes under a minute; they can carry on while it runs." },
    4: { name: "Plan", about: "Choose a plan (a 7-day free trial applies where eligible) or \"Explore free for now\". Without a plan the account is view-only: the business and any Google connection stay set up, but AI replies, review requests and Smart Insights need a paid plan. Plans can be changed any time in Settings, Billing." },
    7: { name: "Automate", about: "One choice sets how replies to new Google reviews work: post happy-review replies automatically and approve the rest, approve every reply, or reply themselves. It only applies to new reviews and can be changed in Settings, Reply rules." },
    5: { name: "All set", about: "Setup finishes and the dashboard opens with a short welcome." },
};

/** Starter questions shown before the owner types, for the step they are on. */
export function setupAssistantStarters(step: number): string[] {
    switch (step) {
        case 1: return ["Why do you need my mobile number?", "Business or agency: which am I?"];
        case 2: return ["Should I connect Google or type it in?", "What happens when I connect Google?", "My business isn't on Google"];
        case 3: return ["My industry isn't listed", "Can I change my review link later?", "What is the support email for?"];
        case 6: return ["What counts as an unhappy review?", "How long does the import take?"];
        case 4: return ["Which plan is right for me?", "What do I get without a plan?", "How does the free trial work?"];
        case 7: return ["Will Zyene post replies without me?", "Can I change this later?"];
        default: return ["What should I do first?"];
    }
}
