/** Full comparison matrix for /compare hub — qualitative; confirm pricing with each vendor. */

export interface HubMatrixRow {
    feature: string;
    zyene: string;
    birdeye: string;
    podium: string;
    nicejob: string;
    gatherup: string;
}

export const HUB_MATRIX_ROWS: HubMatrixRow[] = [
    {
        feature: "Best fit",
        zyene: "Owner-operators focused on Google reviews, alerts, and fast setup",
        birdeye: "Enterprise CX teams with many locations and bundled modules",
        podium: "Teams prioritizing texting, webchat, and payments in one inbox",
        nicejob: "SMBs wanting social proof, referrals, and review marketing",
        gatherup: "Agencies and brands deep on surveys and local reputation programs",
    },
    {
        feature: "Review alerts",
        zyene: "Real-time alerts; unified inbox for Google, Facebook, Yelp",
        birdeye: "Strong multi-location alerting and CX dashboards",
        podium: "Review alerts exist; platform center of gravity is messaging",
        nicejob: "Review notifications; lighter than enterprise CX suites",
        gatherup: "Review monitoring with survey and NPS-driven workflows",
    },
    {
        feature: "AI reply assistance",
        zyene: "AI drafts + optional auto-commenter on paid plans",
        birdeye: "AI replies often gated to higher tiers or add-ons",
        podium: "Basic AI assist; not the core product story",
        nicejob: "Limited vs dedicated review-reply stacks",
        gatherup: "Some AI/help; not positioned as primary AI reply engine",
    },
    {
        feature: "Review request campaigns",
        zyene: "SMS, email, QR; branded collectratings.com flows",
        birdeye: "Mature enterprise campaigns across locations",
        podium: "Requests via messaging workflows; payments adjacent",
        nicejob: "Strong automated review asks + social publishing",
        gatherup: "Solid request tooling tied to feedback programs",
    },
    {
        feature: "Negative feedback / issue-resolution workflow",
        zyene: "Negative Feedback Shield — private capture + fair public paths",
        birdeye: "CX tickets/surveys; no equivalent Shield workflow",
        podium: "Conversation-led recovery; not review-first Shield",
        nicejob: "Basic private feedback options",
        gatherup: "NPS/survey-led recovery; basic private routing",
    },
    {
        feature: "Multi-location support",
        zyene: "Built for 1–few locations; scales without enterprise overhead",
        birdeye: "Industry leader for large multi-location rollouts",
        podium: "Multi-location messaging and payments at scale",
        nicejob: "Multi-location review marketing",
        gatherup: "Agency-friendly multi-client / multi-location setups",
    },
    {
        feature: "Messaging / inbox",
        zyene: "Review inbox focus — not a full payments/texting suite",
        birdeye: "Webchat, ticketing, surveys in one platform",
        podium: "Core strength: texting, webchat, payments depth",
        nicejob: "Social/referral layer more than full CX inbox",
        gatherup: "Feedback-first; lighter than Podium-style messaging",
    },
    {
        feature: "Pricing transparency",
        zyene: "Public plans from $29.99/mo; month-to-month",
        birdeye: "Quote-based; pricing can vary by package, contract, and location count",
        podium: "Quote-based; pricing can vary by package, contract, and location count",
        nicejob: "Published tiers; pricing can vary by package and location count",
        gatherup: "Published tiers; pricing can vary by package and location count",
    },
    {
        feature: "Setup complexity",
        zyene: "Self-serve; connect GBP and launch campaigns quickly",
        birdeye: "Heavier onboarding; often sales-assisted",
        podium: "Implementation for messaging + payments can be involved",
        nicejob: "Moderate; marketing-friendly onboarding",
        gatherup: "Moderate; agency workflows add configuration",
    },
    {
        feature: "Best for small local businesses",
        zyene: "Yes — primary ICP",
        birdeye: "Usually overkill for solo operators",
        podium: "Often more tool than a 1-location shop needs",
        nicejob: "Good fit for marketing-forward SMBs",
        gatherup: "Better when you want surveys/NPS depth",
    },
    {
        feature: "Where this platform is stronger (honest)",
        zyene: "Review-first stack, Shield, competitor tracking, GBP keywords on standard plans",
        birdeye: "Enterprise CX breadth, brand recognition, large-account success teams",
        podium: "Messaging, webchat, and payments in one workflow",
        nicejob: "Reputation marketing, social proof, referrals, video testimonials",
        gatherup: "Feedback collection depth, NPS/surveys, agency white-label",
    },
    {
        feature: "Where Zyene is stronger vs this platform",
        zyene: "Simple review-alert workflow, Shield, AI replies without enterprise tiers",
        birdeye: "Lower entry cost, no annual lock-in, Shield + competitor tracking included",
        podium: "Review monitoring and replies without $300+/mo messaging suite",
        nicejob: "Deeper review ops: Shield, competitor tracking, GBP keyword dashboard",
        gatherup: "Faster review-alert + reply focus without full survey platform scope",
    },
];
