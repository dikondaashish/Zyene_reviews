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
            pricing: "Starter from $29.99/month (as of November 2026).",
            faq: "HVAC review questions",
        },
        lead: {
            title: "Job closed, request sent",
            description: "When a tech marks the job complete, your job software sends a webhook and Zyene texts the homeowner a review request. No one has to remember on the drive to the next call.",
            visual: { kind: "job-webhook", business: "Summit Heating & Air", job: "AC tune-up · Job 4821", customer: "Maria G." },
            visualLabel: "A completed HVAC job sending a webhook that triggers an SMS review request",
            link: TRIGGER_LINK,
            replacesSolution: 0,
        },
        relatedPillars: ["review-collection", "competitor-tracking", "local-seo"],
        editorialSections: [
            {
                id: "hvac-why-reviews-matter",
                eyebrow: "Emergencies & peak seasons",
                heading: "Why HVAC reviews decide calls during emergencies and seasonal peaks",
                intro: "When an air conditioner stops cooling during a heatwave or a furnace fails on a cold night, homeowners do not spend hours comparing websites. They check Google Maps for recent reviews, clear responses, and signs that a local HVAC crew shows up reliably.",
                items: [
                    "Recent feedback matters most when summer and winter rushes hit—old reviews from last year can make a busy shop look inactive.",
                    "Calm, specific owner replies show prospective customers how your office handles scheduling delays or unexpected repair findings.",
                ],
                links: [
                    { label: "Home services reputation management guide", href: "/blog/hvac-home-services-reputation-management" },
                ],
            },
            {
                id: "hvac-installs-and-repairs",
                eyebrow: "Post-job outreach",
                heading: "Review requests after both HVAC installs and routine repairs",
                intro: "Many HVAC contractors only remember to ask after a full system replacement, missing hundreds of seasonal tune-ups and repair calls. Sending an automated SMS or email soon after any completed visit—only to customers who expect messages from your office—builds steady review volume year-round.",
                items: [
                    "Give every homeowner the same honest public review link across maintenance tune-ups, emergency repairs, and full system installs.",
                    "Include clear opt-out wording on automated SMS requests (such as 'Reply STOP to opt out').",
                ],
            },
            {
                id: "hvac-example-replies",
                eyebrow: "Response templates",
                heading: "Example replies for HVAC reviews (no-cool and pricing)",
                intro: "Zyene Reviews drafts replies in your chosen tone, and your team reviews every draft before posting so technical or billing details are accurate.",
                quotes: [
                    {
                        label: "Emergency no-cool / repeat visit",
                        text: "Hi [Name], thank you for letting us know. We understand how stressful a no-cool situation is and are sorry the issue returned after our initial visit. Please call our dispatch desk at [phone] so we can prioritize a follow-up check.",
                    },
                    {
                        label: "Repair or diagnostic pricing concern",
                        text: "Hi [Name], thanks for sharing this feedback. Our technicians aim to walk through diagnostic findings and pricing options before starting work. Please call our office manager at [phone] so we can review your invoice with you.",
                    },
                ],
            },
            {
                id: "hvac-private-feedback-and-volume",
                eyebrow: "Seasonal volume & recovery",
                heading: "Private feedback and handling seasonal review volume",
                intro: "During peak summer and winter months, dispatchers rarely have time to monitor multiple review sites manually. Zyene centralizes incoming reviews in one inbox, lets every homeowner access the same public review link, and offers an optional private feedback form (Negative Feedback Shield) so billing or comfort issues reach your office directly.",
            },
            {
                id: "hvac-integrations-proof-pricing",
                eyebrow: "Integrations, proof & pricing",
                heading: "Dispatch integrations, customer proof, and transparent pricing",
                intro: "Zyene Reviews connects with HVAC dispatch and booking workflows via webhooks (such as a Zapier step when a job closes), our REST API, and Square payment triggers (in early access). Zyene does not currently offer native connectors for ServiceTitan, Housecall Pro, or Jobber. Starter pricing is $29.99/month for one location (as of November 2026; 7-day trial, card required; monthly or annual billing with no annual contract).",
                items: [
                    "TODO (Dispatch Integrations): Add native dispatch connectors only if/when shipped.",
                    "TODO (Customer Proof): Add verified HVAC company testimonials or case-study metrics when available.",
                ],
                links: [
                    { label: "See Zyene Reviews pricing", href: "/pricing" },
                    { label: "Webhook & API triggers", href: "/features/review-collection" },
                ],
            },
        ],
        faqs: [
            { question: "Does Zyene connect to my HVAC dispatch software?", answer: NO_FSM },
            { question: "When should HVAC companies collect reviews?", answer: "All year. Requests sent after spring and autumn maintenance visits mean the profile already looks recent when summer and winter emergencies start." },
            { question: "Can I see which search terms bring HVAC customers to my profile?", answer: "Yes. Google Business Profile insights show the search terms people used to find you, alongside calls and direction requests where Google provides them." },
            { question: "How should I reply to a review about an expensive repair?", answer: "Thank them, explain in general terms that you quote before extra work, and invite them to call the office. Use a draft reviewed by your team before posting." },
            { question: "What does Zyene Reviews cost for an HVAC company?", answer: "Starter is $29.99/month for one location (as of November 2026), with a 7-day trial (card required) and no annual contract." },
        ],
    },
    plumbing: {
        headings: {
            pain: "The freshest reviews get the call.",
            painLede: "Emergency calls go to whoever looks reliable right now.",
            solve: "Ask before you leave the driveway.",
            useCase: "A weekly routine for a busy office.",
            pricing: "Starter from $29.99/month (as of November 2026).",
            faq: "Plumbing review questions",
        },
        lead: {
            title: "A request the moment the job closes",
            description: "Mark the job done in your job software and a webhook tells Zyene to text the customer. The request names your company and links straight to your review page.",
            visual: { kind: "job-webhook", business: "Clearflow Plumbing", job: "Water heater replaced · Job 2219", customer: "Derek P." },
            visualLabel: "A completed plumbing job sending a webhook that triggers an SMS review request",
            link: TRIGGER_LINK,
            replacesSolution: 0,
        },
        relatedPillars: ["review-collection", "ai-replies", "local-seo"],
        editorialSections: [
            {
                id: "plumbing-why-reviews-decide-jobs",
                eyebrow: "Homeowner buying behavior",
                heading: "Why Google reviews decide emergency and planned plumbing jobs",
                intro: "When a pipe leaks or a water heater fails, homeowners rarely read ten websites—they scan Google Maps, check recent review dates, and look at how the plumbing company responds when something goes wrong.",
                items: [
                    "Recent reviews show your crews are active today, not resting on feedback from two years ago.",
                    "Consistent, calm owner replies reassure callers that your office stands behind its estimates and workmanship.",
                    "Giving every customer the same easy review link keeps feedback flowing across both routine drain calls and larger repiping or water-heater installs.",
                ],
                links: [
                    { label: "How to get a Google review link", href: "/blog/how-to-get-a-google-review-link" },
                    { label: "Home services reputation management guide", href: "/blog/hvac-home-services-reputation-management" },
                ],
            },
            {
                id: "plumbing-post-job-sms",
                eyebrow: "Outreach workflow",
                heading: "Post-job SMS review requests that fit a plumbing dispatch",
                intro: "Plumbers move from job to job all day, so manual follow-ups rarely happen. Sending a short SMS soon after the job closes—only to customers who expect text updates from your office—works while the repair is still fresh.",
                items: [
                    "Keep the message direct: thank the homeowner, name your plumbing company, and include your direct Google review link plus opt-out wording (such as 'Reply STOP to opt out').",
                    "Send the same honest invitation to every completed job rather than cherry-picking who receives the public link.",
                    "Example SMS: \"Hi [Name], thanks for having [Company Name] out for your plumbing service today. We'd appreciate an honest Google review when you have a minute: [link] Reply STOP to opt out.\"",
                ],
            },
            {
                id: "plumbing-example-replies",
                eyebrow: "Response templates",
                heading: "Example replies for plumbing reviews (no-show, pricing, and leak)",
                intro: "AI-assisted drafts speed up responses, and every draft is reviewed by your team before posting so you never share private job addresses or unverified details.",
                quotes: [
                    {
                        label: "Late arrival / missed window (no-show)",
                        text: "Hi [Name], thank you for letting us know. We respect your time and are sorry our dispatch window slipped on your appointment. Please call our office at [phone] so we can look into what happened on our schedule.",
                    },
                    {
                        label: "Pricing or estimate concern",
                        text: "Hi [Name], thanks for sharing this feedback. When hidden pipe or fixture conditions change a job's scope, we aim to explain options before proceeding. Please call our office manager at [phone] so we can review your invoice together.",
                    },
                    {
                        label: "Post-repair leak follow-up",
                        text: "Hi [Name], we're sorry to hear you noticed an issue after the repair. Our team stands behind our work and wants to inspect it right away. Please call [phone] or reply to our follow-up message so we can schedule a priority check.",
                    },
                ],
            },
            {
                id: "plumbing-private-billing",
                eyebrow: "Service recovery",
                heading: "Private billing complaint handling without review gating",
                intro: "Estimate surprises and invoice questions are among the most common triggers for 1-star plumbing reviews. Every customer receives the same public review link, while Zyene's Negative Feedback Shield adds an optional private form so frustrated homeowners can message your office directly—giving your team a chance to resolve billing questions before they escalate.",
            },
            {
                id: "plumbing-integrations-and-proof",
                eyebrow: "Integrations, proof & pricing",
                heading: "Field-service integrations, customer proof, and transparent pricing",
                intro: "Zyene Reviews currently integrates with field-service workflows via webhooks (such as a Zapier step when a job closes), our REST API, and Square payment triggers (in early access). Zyene does not currently offer native connectors for Jobber, Housecall Pro, or ServiceTitan. Starter pricing is $29.99/month for one location (as of November 2026; 7-day trial, card required; monthly or annual billing with no annual contract).",
                items: [
                    "TODO (Integrations): Add any native field-service connectors only if/when shipped.",
                    "TODO (Customer Proof): Add verified plumbing company testimonials or case-study metrics when available.",
                ],
                links: [
                    { label: "See Zyene Reviews pricing", href: "/pricing" },
                    { label: "Webhook & API triggers", href: "/features/review-collection" },
                ],
            },
        ],
        faqs: [
            { question: "Does Zyene connect to my plumbing job software?", answer: NO_FSM },
            { question: "How should a plumber reply to an estimate complaint?", answer: "Acknowledge it, explain that hidden conditions can change a quote, and invite the customer to call. Keep the address and job details out of the reply, and review every draft before posting." },
            { question: "Can customers tell me about a billing problem privately?", answer: "Yes. Every customer gets the same public review link, and the review page also offers an optional private form that alerts your office." },
            { question: "When should a plumbing company send a review request?", answer: "Send the request soon after the job is completed and the homeowner has seen the finished repair, rather than waiting days later or sending while a billing question is unresolved." },
            { question: "What does Zyene Reviews cost for a plumbing business?", answer: "Starter is $29.99/month for one location (as of November 2026), with a 7-day trial (card required) and no annual contract." },
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
            visual: { kind: "job-webhook", business: "Brightline Electric", job: "Panel upgrade · Job 1307", customer: "Alicia M." },
            visualLabel: "A completed electrical job sending a webhook that triggers an SMS review request",
            link: TRIGGER_LINK,
            replacesSolution: 0,
        },
        relatedPillars: ["review-campaigns", "smart-insights", "review-collection"],
        faqs: [
            { question: "Does Zyene connect to my electrical contractor software?", answer: NO_FSM },
            { question: "Can I run bulk outreach to past electrical clients?", answer: "Yes. You can launch automated [review request campaigns](/features/review-campaigns) via SMS and email with scheduled follow-ups." },
            { question: "How can I identify trends in customer feedback?", answer: "Zyene uses [AI review insights](/features/smart-insights) to automatically detect recurring praise or complaints about pricing, timeliness, and technician conduct." },
            { question: "Can I show reviews on my website?", answer: "Yes. Embeddable review widgets are included on paid plans and update as new reviews arrive." },
            { question: "How should I reply when a quote changed mid-job?", answer: "Thank the customer, explain in general terms that hidden conditions can change scope, and invite them to call. Use a reviewed draft for these replies." },
        ],
    },
};
