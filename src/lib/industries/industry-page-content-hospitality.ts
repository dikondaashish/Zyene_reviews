import type { IndustryPageContent } from "@/lib/industries/industry-page-content";

/** Restaurants, hotels, salons and gyms: walk-in and appointment businesses. */
export const HOSPITALITY_PAGE_CONTENT: Record<string, IndustryPageContent> = {
    restaurants: {
        headings: {
            pain: "Between the rush and the reviews.",
            painLede: "Diners decide fast, and they read the newest reviews first.",
            solve: "Ask at the table, answer after close.",
            useCase: "One routine for every location.",
            pricing: "Priced for one dining room, or three.",
            faq: "Restaurant review questions",
        },
        lead: {
            title: "A QR code on every table",
            description: "Print a table poster with your review link and QR code. Guests scan it after the meal, so you collect reviews without asking for a phone number at the counter.",
            visual: { kind: "qr-poster" },
            visualLabel: "A printable table poster with a QR code, and the review page it opens on a phone",
            link: { label: "QR code posters and links", href: "/features/qr-code-reviews" },
        },
        relatedPillars: ["qr-code-reviews", "nfc-review-stands", "automatic-review-replies"],
        faqs: [
            { question: "How do restaurants collect reviews without asking for phone numbers?", answer: "Put your review link where guests already look: a QR poster on the table, an NFC stand at the counter, or a link on the receipt. If you also keep guest contacts with permission, you can send SMS or email requests after a visit." },
            { question: "Can Zyene reply to restaurant reviews during service?", answer: "Yes, for Google. Automatic replies can answer new Google reviews at or above a star rating you choose, in a Professional, Friendly or Concise tone. Lower ratings wait in your inbox for a person. Facebook and Yelp reviews are monitored, and you reply on those sites." },
            { question: "Can I offer a discount for a review?", answer: "No. Google's policies prohibit offering incentives for reviews, and Zyene's request templates ask for honest feedback only. Every guest gets the same public review link." },
            { question: "How does Zyene handle a restaurant group with several locations?", answer: "Each location is its own business in Zyene, with its own review link, inbox and alerts. Starter covers one location; Professional covers up to three." },
        ],
    },
    hotels: {
        headings: {
            pain: "Guests read the last stay, not the brochure.",
            painLede: "Room, noise and check-in issues show up in reviews within days of checkout.",
            solve: "Every review answered, even at 3 a.m.",
            useCase: "From checkout to a reply, without gaps.",
            pricing: "Plans that follow your properties.",
            faq: "Hotel review questions",
        },
        lead: {
            title: "Automatic replies for routine praise",
            description: "Let automatic replies answer new Google reviews at or above the star rating you choose. Room and service complaints wait in the inbox for a person who can follow up properly.",
            visual: { kind: "auto-reply" },
            visualLabel: "Automatic Google reply settings with tone and minimum star rating",
            link: { label: "How automatic replies work", href: "/features/automatic-review-replies" },
            replacesSolution: 0,
        },
        relatedPillars: ["automatic-review-replies", "review-monitoring", "multi-location"],
        faqs: [
            { question: "Does Zyene connect to my property-management system?", answer: "Not directly. Post-checkout requests can be triggered by a webhook, for example a Zapier step from your booking or property software, or by the REST API. Your team can also send requests by hand." },
            { question: "Does Zyene monitor Booking.com, Expedia or Tripadvisor?", answer: "No. Zyene syncs Google, Facebook and Yelp. Travel sites need their own tools or processes." },
            { question: "Which hotel reviews get an automatic reply?", answer: "Only new Google reviews at or above the star rating you set, and only after you turn the feature on. Existing reviews, lower ratings and other platforms are left for your team." },
            { question: "Can each property have its own review link?", answer: "Yes. Each property is a separate business with its own link, inbox and alerts. Professional covers up to three locations." },
        ],
    },
    salons: {
        headings: {
            pain: "When a cut or color misses.",
            painLede: "Clients review the result, and the wait, in their own words.",
            solve: "Your salon's voice in every reply.",
            useCase: "A follow-up routine for the front desk.",
            pricing: "One plan for every chair.",
            faq: "Salon and spa review questions",
        },
        lead: {
            title: "Replies in your salon's voice",
            description: "Pick a Friendly, Professional or Concise draft, edit it, and post. Mention the stylist by name when the client did; keep appointment details private.",
            visual: { kind: "tone-drafts" },
            visualLabel: "A Google review with three AI reply drafts in different tones",
            link: { label: "AI reply drafts", href: "/features/ai-replies" },
            replacesSolution: 1,
        },
        relatedPillars: ["ai-replies", "review-requests", "review-widgets"],
        faqs: [
            { question: "Does Zyene connect to my salon booking software?", answer: "Not directly. Requests can be triggered after a completed appointment by a webhook, such as a Zapier step from your booking tool, or by the API. The front desk can also send them by hand." },
            { question: "Should a reply mention the stylist?", answer: "If the client named them, a thank-you that mentions the stylist reads naturally. Avoid repeating services, prices or anything the client did not say publicly." },
            { question: "Can I show reviews on my salon website?", answer: "Yes. Embeddable review widgets are included on paid plans and update as new reviews arrive." },
            { question: "What happens when a client is unhappy?", answer: "Every client gets the same public review link. The optional private feedback form lets them also reach the owner directly, and your team is alerted to follow up." },
        ],
    },
    fitness: {
        headings: {
            pain: "Reviews that follow the membership.",
            painLede: "First visits, cancellations and crowded classes drive most of what members write.",
            solve: "Steady reviews, not a January scramble.",
            useCase: "A studio routine that runs itself.",
            pricing: "One plan for the whole studio.",
            faq: "Gym and studio review questions",
        },
        lead: {
            title: "Campaigns for the quiet months",
            description: "Start from a built-in template, choose SMS or email and a send delay, and add reminders that stop once a member clicks. Run it in autumn so January visitors see recent reviews.",
            visual: { kind: "campaign-templates" },
            visualLabel: "Built-in review campaign templates and the editable SMS message",
            link: { label: "Review campaigns", href: "/features/review-campaigns" },
            replacesSolution: 0,
        },
        relatedPillars: ["review-campaigns", "nfc-review-stands", "competitor-tracking"],
        faqs: [
            { question: "When should a gym ask members for reviews?", answer: "After a first class or a milestone visit works well. Avoid asking during a cancellation or billing dispute; resolve the issue first." },
            { question: "Can members leave a review at the front desk?", answer: "Yes. An NFC stand or QR code at the desk opens your review page with a tap or a scan, with no app to install." },
            { question: "Does Zyene connect to my membership software?", answer: "Not directly. You can import members by CSV, trigger requests with a webhook such as a Zapier step, or use the API." },
            { question: "How do I see how I compare with nearby gyms?", answer: "Competitor tracking compares your rating and review volume with the gyms you choose and alerts you when a competitor's reviews spike." },
        ],
    },
};
