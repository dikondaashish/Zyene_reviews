import { ONBOARDING_STEP } from "@/app/onboarding/onboarding-types";

/** What the setup assistant says on each step: short, first person, about the owner's business. */
export function onboardingGuideMessage(step: number, firstName: string, businessName: string | null, reviews = 0): string {
    const biz = businessName ?? "your business";
    switch (step) {
        case ONBOARDING_STEP.about:
            return `Hi ${firstName}! I'm your Zyene assistant. I'll have your reviews working for you in about three minutes.`;
        case ONBOARDING_STEP.business:
            return businessName
                ? `Found ${biz}. Check the details look right, then press Continue.`
                : "First, let's find your business. Start typing its name and I'll fill in the rest from Google.";
        case ONBOARDING_STEP.details:
            return `${businessName ?? "Your business"} is looking good. Which industry are you in? I'll match my reply style to it.`;
        case ONBOARDING_STEP.results:
            return reviews > 0
                ? `Here's what customers are saying about ${biz} on Google. Let's see where I can help first.`
                : "I'm reading your Google reviews now. Your numbers will appear in a moment.";
        case ONBOARDING_STEP.plan:
            return `Pick a plan and I'll start replying to reviews for ${biz} and asking happy customers for new ones.`;
        case ONBOARDING_STEP.automate:
            return "Last thing: tell me how much you'd like me to handle on my own. You can change it any time.";
        default:
            return `All set, ${firstName}! Opening your dashboard now.`;
    }
}
