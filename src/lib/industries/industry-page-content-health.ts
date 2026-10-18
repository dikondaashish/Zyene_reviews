import type { IndustryPageContent } from "@/lib/industries/industry-page-content";

const PHI_ANSWER = "Keep health information out of review requests, public replies and private feedback notes. A reply should never confirm that the reviewer is a patient or mention their care. Check your own privacy obligations before choosing any review tool.";

/** Dental and medical practices: replies are drafted and reviewed by a person; automatic replies stay off. */
export const HEALTH_PAGE_CONTENT: Record<string, IndustryPageContent> = {
    dental: {
        headings: {
            pain: "Patients read reviews before they book.",
            painLede: "Billing questions and wait times shape more reviews than the dentistry.",
            solve: "Careful replies, approved by your team.",
            useCase: "A review routine the front desk can own.",
            pricing: "One plan for the practice, or three.",
            faq: "Dental practice review questions",
        },
        lead: {
            title: "Every reply reviewed. Automatic replies off.",
            description: "AI drafts a general, courteous reply and it waits for your team. Nothing posts until someone approves it, and automatic Google replies stay off unless the practice chooses to turn them on.",
            visual: {
                kind: "reviewed-drafts",
                business: "Bright Smile Dental",
                reviewer: "Karen W.",
                review: "Friendly hygienist, but I waited 40 minutes past my appointment time.",
                draft: "Thank you for your feedback, Karen. We're sorry about the wait and we'd like to hear more. Please call our office manager so we can look into it.",
            },
            visualLabel: "A reply draft waiting for approval, with automatic Google replies switched off",
            link: { label: "Reviewed AI drafts", href: "/features/ai-replies" },
            replacesSolution: 1,
        },
        relatedPillars: ["ai-replies", "review-requests", "multi-location"],
        faqs: [
            { question: "Should a dental practice use automatic review replies?", answer: "Most practices should not. Use reviewed drafts so a person checks that every reply stays general and doesn't confirm a patient relationship. Zyene's automatic Google replies are off by default and only run if you turn them on." },
            { question: "How should a dentist reply to a negative review?", answer: "Thank the reviewer, acknowledge the concern in general terms, and invite them to call the office. Don't mention treatment, appointments or billing details in public." },
            { question: "Does Zyene connect to my practice-management software?", answer: "Not directly. Post-appointment requests can be triggered by a webhook, such as a Zapier step, or by the API, and staff can send them by hand." },
            { question: "What about patient privacy?", answer: PHI_ANSWER },
        ],
    },
    medical: {
        headings: {
            pain: "Wait times write the reviews.",
            painLede: "Most complaints are about the front desk, scheduling and billing, not the care itself.",
            solve: "Drafts your staff can trust.",
            useCase: "A shared process across clinic locations.",
            pricing: "Plans for a clinic or a small group.",
            faq: "Medical practice review questions",
        },
        lead: {
            title: "Drafts that wait for staff approval",
            description: "Each reply starts as a neutral draft that never names a condition or visit. Staff edit and approve it; automatic Google replies stay off unless the practice turns them on.",
            visual: {
                kind: "reviewed-drafts",
                business: "Lakeside Family Clinic",
                reviewer: "Tom R.",
                review: "Couldn't get anyone on the phone to reschedule. Took three tries.",
                draft: "Thank you for letting us know, Tom. We're sorry it was hard to reach us. Please call the main line and ask for our practice manager so we can help.",
            },
            visualLabel: "A neutral reply draft awaiting staff approval, with automatic replies switched off",
            link: { label: "Reviewed AI drafts", href: "/features/ai-replies" },
            replacesSolution: 1,
        },
        relatedPillars: ["ai-replies", "review-monitoring", "review-page"],
        faqs: [
            { question: "Can a medical practice reply to reviews at all?", answer: "Yes, carefully. A general thank-you or an invitation to call the office is fine. Never confirm that the reviewer is a patient or discuss their care." },
            { question: "Are automatic replies safe for a medical practice?", answer: "We recommend keeping them off. Zyene's automatic Google replies only run if you turn them on; reviewed drafts let staff check every word first." },
            { question: "How do patients share a concern privately?", answer: "Every patient gets the same public review link. The review page also offers an optional private form, and your team is alerted when someone uses it." },
            { question: "Which review sites does Zyene cover for clinics?", answer: "Google, Facebook and Yelp, in one inbox with alerts. Healthcare directories are not synced." },
            { question: "What about patient privacy?", answer: PHI_ANSWER },
        ],
    },
};
