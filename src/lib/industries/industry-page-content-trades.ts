import type { IndustryPageContent } from "@/lib/industries/industry-page-content";

const NO_FSM = "Not directly. Zyene has no native field-service connector. Send a webhook when a job closes, for example a Zapier step from your job software, or call the REST API. Test one job before turning it on for the whole team.";
const TRIGGER_LINK = { label: "Webhook and API triggers", href: "/features/review-collection" };

/** Auto repair and the home-service trades: requests start when a job closes. */
export const TRADES_PAGE_CONTENT: Record<string, IndustryPageContent> = {
    "auto-repair": {
        headings: {
            pain: "Trust is decided before the first call.",
            painLede: "Drivers compare shops on recent reviews, and estimate surprises show up there first.",
            solve: "Answer the angry review first.",
            useCase: "From pickup to reply, in one shop routine.",
            pricing: "Less than one oil change a month.",
            faq: "Auto repair review questions",
        },
        lead: {
            title: "Urgent reviews first, with a draft ready",
            description: "The dashboard puts low-rated reviews at the top with an urgency score and an owner-voice draft. Edit it, send it, and invite the customer to talk through the invoice.",
            visual: { kind: "attention-drafts" },
            visualLabel: "Dashboard list of urgent reviews with an AI reply draft for a billing complaint",
            link: { label: "AI reply drafts", href: "/features/ai-replies" },
            replacesSolution: 1,
        },
        relatedPillars: ["ai-replies", "competitor-tracking", "review-requests"],
        faqs: [
            { question: "How should a shop reply to a review about a surprise bill?", answer: "Apologise for the surprise, explain the shop's policy of calling before extra work in general terms, and invite the customer to go through the invoice with you. Don't argue line items in public." },
            { question: "Can I send a review request when the car is picked up?", answer: "Yes. Send it by hand at pickup, or trigger it from a webhook or the API. If your shop takes payment through Square, a payment-triggered request is in early access." },
            { question: "Can I compare my shop with nearby shops?", answer: "Competitor tracking shows your rating and review count next to the shops you choose, with an alert when a competitor's reviews spike." },
        ],
    },
    "home-services": {
        headings: {
            pain: "Homeowners hire the reviews they read.",
            painLede: "Price surprises and no-shows hurt more than a slow job.",
            solve: "Let the job ask for the review.",
            useCase: "One routine across every crew.",
            pricing: "Plans for one truck or three offices.",
            faq: "Home service review questions",
        },
        lead: {
            title: "Trigger requests from the job, not from memory",
            description: "Start a request when a job closes: a REST API call, a webhook such as a Zapier step, or a Square payment while that integration is in early access.",
            visual: { kind: "request-triggers" },
            visualLabel: "REST API example, Square trigger in early access, and an active Zapier webhook",
            link: TRIGGER_LINK,
            replacesSolution: 0,
        },
        relatedPillars: ["review-collection", "review-campaigns", "competitor-tracking"],
        faqs: [
            { question: "Does Zyene connect to Jobber, Housecall Pro or ServiceTitan?", answer: NO_FSM },
            { question: "When should a home-service business ask for a review?", answer: "Soon after the job is finished and the customer has seen the result, usually the same day. Don't ask while an invoice is disputed." },
            { question: "Do you have pages for specific trades?", answer: "Yes. See the HVAC, plumbing and electrician pages linked on this page for trade-specific workflows." },
        ],
    },
    hvac: {
        headings: {
            pain: "Peak season is a review contest.",
            painLede: "When the heat breaks, homeowners call whoever looks most trusted on Google.",
            solve: "Every closed job sends the ask.",
            useCase: "Off-season prep for the rush.",
            pricing: "Cheaper than one service call.",
            faq: "HVAC review questions",
        },
        lead: {
            title: "Job closed, request sent",
            description: "When a tech marks the job complete, your job software sends a webhook and Zyene texts the homeowner a review request. No one has to remember on the drive to the next call.",
            visual: { kind: "job-webhook", business: "Summit Heating & Air", job: "AC tune-up · Job #4821", customer: "Maria G." },
            visualLabel: "A completed HVAC job sending a webhook that triggers an SMS review request",
            link: TRIGGER_LINK,
            replacesSolution: 0,
        },
        relatedPillars: ["review-collection", "competitor-tracking", "local-seo"],
        faqs: [
            { question: "Does Zyene connect to my HVAC dispatch software?", answer: NO_FSM },
            { question: "When should HVAC companies collect reviews?", answer: "All year. Requests sent after spring and autumn maintenance visits mean the profile already looks recent when summer and winter emergencies start." },
            { question: "Can I see which search terms bring HVAC customers to my profile?", answer: "Yes. Google Business Profile insights show the search terms people used to find you, alongside calls and direction requests where Google provides them." },
            { question: "How should I reply to a review about an expensive repair?", answer: "Thank them, explain in general terms that you quote before extra work, and invite them to call the office. Use a reviewed draft rather than an automatic reply." },
        ],
    },
    plumbing: {
        headings: {
            pain: "The freshest reviews get the call.",
            painLede: "Emergency calls go to whoever looks reliable right now.",
            solve: "Ask before you leave the driveway.",
            useCase: "A weekly routine for a busy office.",
            pricing: "Less than one drain call a month.",
            faq: "Plumbing review questions",
        },
        lead: {
            title: "A request the moment the job closes",
            description: "Mark the job done in your job software and a webhook tells Zyene to text the customer. The request names your company and links straight to your review page.",
            visual: { kind: "job-webhook", business: "Clearflow Plumbing", job: "Water heater replaced · Job #2219", customer: "Derek P." },
            visualLabel: "A completed plumbing job sending a webhook that triggers an SMS review request",
            link: TRIGGER_LINK,
            replacesSolution: 0,
        },
        relatedPillars: ["review-collection", "ai-replies", "local-seo"],
        faqs: [
            { question: "Does Zyene connect to my plumbing job software?", answer: NO_FSM },
            { question: "How should a plumber reply to an estimate complaint?", answer: "Acknowledge it, explain that hidden conditions can change a quote, and invite the customer to call. Keep the address and job details out of the reply." },
            { question: "Can customers tell me about a billing problem privately?", answer: "Yes. Every customer gets the same public review link, and the review page also offers an optional private form that alerts your office." },
        ],
    },
    electricians: {
        headings: {
            pain: "Homeowners check twice before opening the panel.",
            painLede: "Electrical work is licensed and high-stakes, so a thin review profile loses the job.",
            solve: "Reviews that keep up with your crews.",
            useCase: "From panel upgrade to public proof.",
            pricing: "Plans sized for small crews.",
            faq: "Electrician review questions",
        },
        lead: {
            title: "Requests that start on job completion",
            description: "When a panel upgrade or rewire is closed out, a webhook from your job software triggers the review request. Your electricians stay on the work.",
            visual: { kind: "job-webhook", business: "Brightline Electric", job: "Panel upgrade · Job #1307", customer: "Alicia M." },
            visualLabel: "A completed electrical job sending a webhook that triggers an SMS review request",
            link: TRIGGER_LINK,
            replacesSolution: 0,
        },
        relatedPillars: ["review-collection", "competitor-tracking", "review-widgets"],
        faqs: [
            { question: "Does Zyene connect to my electrical contractor software?", answer: NO_FSM },
            { question: "Can I show reviews on my website?", answer: "Yes. Embeddable review widgets are included on paid plans and update as new reviews arrive." },
            { question: "How should I reply when a quote changed mid-job?", answer: "Thank the customer, explain in general terms that hidden conditions can change scope, and invite them to call. Use a reviewed draft for these replies." },
        ],
    },
};
