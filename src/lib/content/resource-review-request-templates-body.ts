import type { ContentSection } from "./blog-data";
import { SIGNUP_URL } from "@/config/env";

/** Body sections for /resources/review-request-templates (22 templates). */
export const REVIEW_REQUEST_TEMPLATES_BODY: ContentSection[] = [
    {
        type: "summary",
        text: "Copy-paste SMS and email scripts for honest review outreach - plus industry variants, one reminder, thank-you notes, and a private-feedback follow-up. Replace [Name], [Business Name], and [link] with your details.",
    },
    { type: "h2", text: "Responsible Outreach" },
    {
        type: "warning",
        text: "Do not offer discounts, gifts, or incentives tied to a rating or review text. Do not pressure customers with repeated messages. Invite real customers honestly, keep outreach proportional (one follow-up max per visit), and configure the process to match your business's documented review policy.",
    },
    {
        type: "ul",
        items: [
            "**Not legal advice:** The notes below are practical outreach guidelines, not legal advice. Check the messaging, consumer-protection, and platform rules that apply in your region before launching campaigns.",
            "**No review gating:** Give every customer the same honest invitation to leave a public Google review rather than filtering out unhappy customers before showing the public review link.",
            "**Consent and opt-out rules vary by region:** Messaging regulations (such as TCPA-style opt-in rules in the US) depend on where you operate and how you collect phone numbers. Send automated texts only to customers who expect messages from you and include a clear opt-out.",
        ],
    },
    {
        type: "p",
        text: "Need the direct link to put into these scripts? Generate your clean review link in seconds with our [free Google review link generator](/tools/review-link-generator).",
    },
    { type: "h2", text: "How to Ask for a Review: Timing, Channel, and Link" },
    {
        type: "ul",
        items: [
            "**Timing:** Ask soon after the service, while the experience is fresh. Customers remember specific details best right after a completed visit, pickup, or job.",
            "**Channel:** Use SMS for quick, mobile-friendly visits and email when you already send a receipt, invoice, or project summary. For a deeper breakdown, see our guide on [whether SMS or email works better for review requests](/blog/is-sms-or-email-better-for-review-requests).",
            "**Direct link:** Always link straight to your Google review prompt instead of asking customers to search your business name on Google Maps.",
        ],
    },
    { type: "h2", text: "SMS Review Request Templates" },
    {
        type: "p",
        text: "Send SMS review requests only to customers who have opted in or expect text updates from your business, and keep an opt-out line such as `Reply STOP to opt out.` at the end of automated texts.",
    },
    { type: "h3", text: "1. General - short and direct" },
    {
        type: "quote",
        text: "Hi [Name], thanks for visiting [Business Name] today. If your experience was good, we'd appreciate an honest Google review when you have a minute: [link] Reply STOP to opt out.",
    },
    { type: "h3", text: "2. Personal note from the owner" },
    {
        type: "quote",
        text: "Hi [Name], [Owner Name] here from [Business Name]. Thank you for your business. An honest Google review helps other locals find us: [link] Reply STOP to opt out.",
    },
    { type: "h3", text: "3. Service business - job complete" },
    {
        type: "quote",
        text: "Hi [Name], your service with [Business Name] is wrapped up. If everything met your expectations, a quick honest review on Google helps: [link] Thank you! Reply STOP to opt out.",
    },
    { type: "h3", text: "4. Post-visit follow-up" },
    {
        type: "quote",
        text: "Hi [Name], hope you're still feeling good about your visit to [Business Name]. When you have 60 seconds, an honest Google review means a lot: [link] Reply STOP to opt out.",
    },
    { type: "h3", text: "5. Professional appointment (dental, medical-adjacent)" },
    {
        type: "quote",
        text: "Hi [Name], thank you for your appointment at [Business Name]. If your visit went well, we'd value an honest Google review: [link] Reply STOP to opt out.",
    },
    { type: "h2", text: "Email Review Request Templates" },
    {
        type: "p",
        text: "Each email template below includes two to three subject line options so you can test what feels most natural for your customers.",
    },
    { type: "h3", text: "6. Simple follow-up email" },
    {
        type: "quote",
        text: "Subject options:\n- Quick favor from [Business Name]\n- How did we do today, [Name]?\n- Got a minute to share honest feedback?\n\nHi [Name],\n\nThank you for visiting us on [date]. If you have a minute, an honest Google review helps neighbors discover [Business Name].\n\n→ [link]\n\nThank you,\n[Your Name]",
    },
    { type: "h3", text: "7. Personal note from the owner" },
    {
        type: "quote",
        text: "Subject options:\n- Thank you from [Owner Name] at [Business Name]\n- A quick note from [Owner Name]\n- Thank you for choosing [Business Name]\n\nHi [Name],\n\nI appreciate you choosing us. If your experience was positive, a Google review helps our small team more than you might think.\n\n→ [link]\n\nGratefully,\n[Owner Name]",
    },
    { type: "h3", text: "8. Project or service completion" },
    {
        type: "quote",
        text: "Subject options:\n- Your [service] is complete\n- Wrapping up your [service] with [Business Name]\n- How did your [service] go?\n\nHi [Name],\n\nWe finished your [service description]. If you're satisfied, we'd be grateful for an honest review on Google.\n\n→ [link]\n\n[Business Name] Team",
    },
    { type: "h3", text: "9. Post-visit email" },
    {
        type: "quote",
        text: "Subject options:\n- How was your visit to [Business Name]?\n- Thanks for visiting [Business Name], [Name]\n- Share your honest thoughts on [Business Name]\n\nHi [Name],\n\nWe hope your recent visit went smoothly. Your honest feedback on Google helps us improve and helps others know what to expect.\n\n→ [link]\n\nThank you!",
    },
    { type: "h2", text: "Industry-Specific Templates" },
    { type: "h3", text: "10. Restaurant" },
    {
        type: "quote",
        text: "Hi [Name], thanks for dining at [Restaurant Name]. If you enjoyed your meal, an honest Google review helps our team: [link]",
    },
    { type: "h3", text: "11. Dental practice" },
    {
        type: "quote",
        text: "Hi [Name], thank you for visiting [Practice Name]. If your appointment was comfortable, we'd appreciate an honest Google review: [link]",
    },
    { type: "h3", text: "12. Salon / spa" },
    {
        type: "quote",
        text: "Hi [Name], thanks for visiting [Salon Name] for your [service]. If you love the result, an honest review on Google helps: [link]",
    },
    { type: "h3", text: "13. HVAC / home services" },
    {
        type: "quote",
        text: "Hi [Name], [Company Name] finished your [HVAC/plumbing/etc.] visit. If the work met your expectations, an honest Google review helps homeowners find us: [link]",
    },
    { type: "h3", text: "14. Auto repair" },
    {
        type: "quote",
        text: "Hi [Name], your vehicle is ready at [Shop Name]. If you're happy with the service, an honest Google review helps: [link] Drive safe!",
    },
    { type: "h3", text: "15. In-person / QR placard (one line)" },
    {
        type: "quote",
        text: "Enjoyed your visit? Scan for an honest Google review - thank you for supporting [Business Name].",
    },
    { type: "h2", text: "Reminder, Thank-You & Private Feedback" },
    {
        type: "p",
        text: "A simple reminder sequence keeps outreach polite without fatiguing customers: send your initial request soon after the service while the experience is fresh, send at most one gentle reminder 5-7 days later if they haven't responded, and then stop.",
    },
    { type: "h3", text: "16. Reminder (one follow-up, 5-7 days later)" },
    {
        type: "quote",
        text: "Hi [Name], gentle reminder from [Business Name] - if you have a moment, an honest Google review still helps us: [link] This is our only follow-up. Thank you!",
    },
    { type: "h3", text: "17. Follow-up email (non-responders)" },
    {
        type: "quote",
        text: "Subject: One reminder from [Business Name]\n\nHi [Name],\n\nWe asked last week if you'd share an honest Google review. No pressure - this is our last note.\n\n→ [link]\n\nThanks for being a customer,\n[Business Name]",
    },
    { type: "h3", text: "18. Thank-you after a review" },
    {
        type: "quote",
        text: "Hi [Name], we saw your Google review - thank you for taking the time. It means a lot to our team at [Business Name]. Hope to see you again soon!",
    },
    { type: "h3", text: "18b. Thank-you for a detailed public review" },
    {
        type: "quote",
        text: "Hi [Name], thank you for sharing such specific feedback about working with [Team Member / Business Name] on Google. We passed your note along to the team—we truly appreciate your support.",
    },
    { type: "h3", text: "18c. Thank-you after resolving private feedback" },
    {
        type: "quote",
        text: "Hi [Name], thank you for giving us the chance to follow up and make things right at [Business Name]. We appreciate your honest feedback and your patience.",
    },
    {
        type: "p",
        text: "For public reply ideas you can post directly on your Google Business Profile, see our [positive review response examples](/blog/how-to-respond-to-a-positive-review).",
    },
    { type: "h3", text: "19. Negative feedback follow-up (private resolution)" },
    {
        type: "quote",
        text: "Hi [Name], we're sorry your experience at [Business Name] wasn't what it should be. Please reply here or call [phone] so we can make it right. Your honest feedback helps us improve - we're not asking you to change a public review.",
    },
    { type: "h3", text: "20. Loyalty / repeat customer" },
    {
        type: "quote",
        text: "Hi [Name], thanks for coming back to [Business Name]. If today's visit went well, an honest Google review helps us keep serving the community: [link]",
    },
    { type: "h3", text: "21. Same-day evening check-in" },
    {
        type: "quote",
        text: "Hi [Name], [Business Name] here - hope your day went well after your visit. When you have a spare minute, an honest Google review helps: [link]",
    },
    { type: "h3", text: "22. Email reminder (final)" },
    {
        type: "quote",
        text: "Subject: Last note from [Business Name]\n\nHi [Name],\n\nWe won't message again about reviews. If you still want to share honest feedback: [link]\n\nThank you for your business.",
    },
    { type: "h2", text: "Where to Place Your Review Link" },
    {
        type: "p",
        text: "Sending a direct review link works best when customers see it in the channels they already check. If you do not have your direct link yet, follow our [step-by-step guide to getting a Google review link](/blog/how-to-get-a-google-review-link).",
    },
    {
        type: "ul",
        items: [
            "**Post-service SMS or email:** The highest-visibility placement, sent soon after the service while the experience is fresh.",
            "**Digital invoices and receipts:** Add a short one-line link at the bottom of paid invoices or appointment summaries.",
            "**Team email signatures:** Include a simple 'Leave us an honest Google review' link for ongoing client communication.",
            "**Countertop QR cards or leave-behinds:** Useful for restaurants, clinics, and home-service technicians finishing a job on site.",
        ],
    },
    { type: "h2", text: "How Zyene Reviews Automates This Workflow" },
    {
        type: "summary",
        text: "Instead of copying templates into a spreadsheet for every customer, Zyene Reviews sends branded SMS and email campaigns from your dashboard, tracks who was contacted, and alerts you when new reviews arrive.",
    },
    { type: "ul", items: [
        "Upload customers or trigger requests from POS/Zapier when a job completes",
        "Use your branded collectratings.com page and Negative Feedback Shield for private issue capture",
        "Get alerts for new Google, Facebook, and Yelp reviews in one inbox",
        "Draft replies with AI assistance - you approve before posting",
        "See campaign status without manual spreadsheet tracking",
    ]},
    { type: "p", text: "Learn how Shield organizes private feedback on [Negative Feedback Shield](/blog/negative-feedback-shield). Uncover recurring customer praise and operational themes with [AI review insights and themes](/features/smart-insights). Compare platforms on [platform comparisons](/compare); view public plans on [pricing](/pricing)." },
    { type: "h2", text: "Manual vs Spreadsheet vs Zyene Reviews" },
    {
        type: "table",
        table: {
            headers: ["Approach", "Sending requests", "Tracking who was asked", "Review alerts", "Typical fit"],
            rows: [
                [
                    "Manual copy-paste",
                    "You text or email one customer at a time",
                    "Memory or ad-hoc notes",
                    "Check Google manually",
                    "Very low volume",
                ],
                [
                    "Spreadsheet tracking",
                    "Mail merge or bulk SMS tools",
                    "Rows and columns you maintain",
                    "Still manual inbox checks",
                    "Small teams without automation",
                ],
                [
                    "Zyene Reviews campaigns + alerts",
                    "SMS, email, and QR from one dashboard",
                    "Built-in request and review history",
                    "Unified alerts across platforms",
                    "Owner-operators scaling reviews",
                ],
            ],
        },
    },
    {
        type: "tip",
        text: "Request the pack at the top of this page - we email a link to this URL (source: review_request_templates). No PDF attachment yet; the web version is ready now. Copy any preview template below without logging in.",
    },
    { type: "cta", ctaLabel: "Automate review requests with Zyene Reviews →", ctaHref: SIGNUP_URL },
    { type: "cta", ctaLabel: "See review collection features →", ctaHref: "/features/review-collection" },
];
