/** Help for whichever onboarding step the owner is stuck on. Article paths are `/help/<category>/<slug>`. */
export const HELP_CENTER_URL = "https://www.zyenereviews.com/help";
export const SUPPORT_EMAIL = "support@zyenereviews.com";

type StepHelp = { stepName: string; article: { title: string; path: string } };

const GETTING_STARTED: StepHelp = {
    stepName: "Connect",
    article: { title: "Connecting your Google Business Profile", path: "/getting-started/connecting-google-business-profile" },
};

const STEP_HELP: Record<number, StepHelp> = {
    1: { stepName: "About you", article: { title: "Creating your account", path: "/getting-started/creating-your-account" } },
    2: GETTING_STARTED,
    3: { stepName: "Business details", article: { title: "Creating your account", path: "/getting-started/creating-your-account" } },
    6: { stepName: "Your results", article: { title: "Understanding your dashboard", path: "/getting-started/understanding-your-dashboard" } },
    4: { stepName: "Plan", article: { title: "Plans and pricing", path: "/billing/plans-and-pricing" } },
    7: { stepName: "Automate", article: { title: "Setting up automatic Google replies", path: "/reviews/setting-up-auto-commenter" } },
    5: { stepName: "All set", article: { title: "Sending your first review request", path: "/getting-started/sending-your-first-review-request" } },
};

export function onboardingHelpFor(step: number) {
    const help = STEP_HELP[step] ?? GETTING_STARTED;
    const subject = `Help with setup: ${help.stepName} step`;
    return {
        stepName: help.stepName,
        articleTitle: help.article.title,
        articleUrl: `${HELP_CENTER_URL}${help.article.path}`,
        emailUrl: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`,
    };
}
