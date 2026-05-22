// ─────────────────────────────────────────────────────────────────────────────
// Case Study Data — Phase 5
// Representative customer outcomes (composite stories based on typical results).
// Replace with permissioned customer stories as they become available.
// ─────────────────────────────────────────────────────────────────────────────

export interface CaseStudyMetric {
    label: string;
    before: string;
    after: string;
    change: string;
}

export interface CaseStudy {
    slug: string;
    company: string;
    industry: string;
    industrySlug: string;
    location: string;
    size: string;
    emoji: string;
    headline: string;
    excerpt: string;
    challenge: string;
    solutionFeatures: string[];
    metrics: CaseStudyMetric[];
    quote: string;
    quoteAuthor: string;
    quoteRole: string;
    timeline: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
    {
        slug: "sunrise-dental-austin",
        company: "Sunrise Dental",
        industry: "Dental",
        industrySlug: "dental",
        location: "Austin, TX",
        size: "2 locations · 12 staff",
        emoji: "🦷",
        headline: "From 23 to 89 Google reviews in 90 days — without hiring marketing staff",
        excerpt: "A two-location dental practice used Zyene's Negative Feedback Shield and automated review requests to grow their Google rating from 4.1 to 4.7 stars.",
        challenge:
            "Sunrise Dental had strong chair-side satisfaction but only 23 Google reviews after five years in business. Negative billing complaints occasionally went public because the front desk had no system to intercept unhappy patients before they posted. The office manager spent 45 minutes per week trying to respond to reviews manually.",
        solutionFeatures: [
            "Automated SMS review requests after every checkout",
            "Negative Feedback Shield routing 1–3 star experiences to private resolution",
            "AI reply suggestions with HIPAA-safe tone defaults",
            "Multi-location dashboard for both Austin offices",
        ],
        metrics: [
            { label: "Google reviews", before: "23", after: "89", change: "+287%" },
            { label: "Average rating", before: "4.1 ★", after: "4.7 ★", change: "+0.6" },
            { label: "Response rate", before: "12%", after: "100%", change: "Full coverage" },
            { label: "Avg. response time", before: "6 days", after: "4 hours", change: "−96%" },
        ],
        quote:
            "We stopped dreading Google reviews. Unhappy patients reach us privately first, and our happy patients actually leave reviews now — we went from asking randomly to a system that runs every day.",
        quoteAuthor: "Dr. Priya Mehta",
        quoteRole: "Owner, Sunrise Dental",
        timeline: "90 days on Zyene Starter",
        metaTitle: "Sunrise Dental Case Study — 23 to 89 Google Reviews | Zyene Reviews",
        metaDescription:
            "How Sunrise Dental grew from 23 to 89 Google reviews in 90 days using Zyene's Negative Feedback Shield, SMS review requests, and AI replies.",
        keywords: ["dental review management case study", "google reviews dental practice", "zyene reviews case study"],
    },
    {
        slug: "wolfpack-bbq-charlotte",
        company: "Wolfpack BBQ",
        industry: "Restaurants",
        industrySlug: "restaurants",
        location: "Charlotte, NC",
        size: "1 location · 28 staff",
        emoji: "🍽️",
        headline: "A Charlotte BBQ joint added 64 five-star reviews in 60 days",
        excerpt: "Wolfpack BBQ turned inconsistent review collection into a post-checkout SMS habit — and protected their 4.6-star rating with the Negative Feedback Shield.",
        challenge:
            "Weekend rushes meant managers forgot to ask for reviews. A few cold-food complaints became public 2-star reviews before the team could make it right. Competitors on the same block had 200+ reviews; Wolfpack had 41.",
        solutionFeatures: [
            "SMS review requests 2 hours after dine-in checkout",
            "Table tent QR codes linked to the same review flow",
            "Auto-commenter for 4–5 star Google reviews",
            "Competitor tracking for three nearby BBQ restaurants",
        ],
        metrics: [
            { label: "Google reviews", before: "41", after: "105", change: "+156%" },
            { label: "5-star reviews (60 days)", before: "—", after: "+64", change: "New" },
            { label: "1-star reviews prevented", before: "—", after: "11", change: "Shield" },
            { label: "Local map pack rank", before: "#7", after: "#2", change: "↑ 5 spots" },
        ],
        quote:
            "The SMS after dinner works better than anything we tried before. And when something goes wrong, we hear about it in private — not on Google the next morning.",
        quoteAuthor: "Marcus Webb",
        quoteRole: "Owner, Wolfpack BBQ",
        timeline: "60 days on Zyene Professional",
        metaTitle: "Wolfpack BBQ Case Study — Restaurant Review Growth | Zyene Reviews",
        metaDescription:
            "How Wolfpack BBQ added 64 five-star Google reviews in 60 days with automated SMS requests and the Negative Feedback Shield.",
        keywords: ["restaurant review management case study", "get more restaurant google reviews", "zyene restaurant reviews"],
    },
    {
        slug: "apex-hvac-denver",
        company: "Apex HVAC & Plumbing",
        industry: "Home Services",
        industrySlug: "home-services",
        location: "Denver, CO",
        size: "1 location · 18 technicians",
        emoji: "🔧",
        headline: "Home services company cut public 1-stars by 70% in the first quarter",
        excerpt: "Apex HVAC used private feedback routing and Zapier-triggered review requests after job completion to grow trust before the first phone call.",
        challenge:
            "Technicians finished great work but never asked for reviews. Billing disputes and no-show confusion occasionally became 1-star Google reviews. The owner responded to reviews once a month, if at all.",
        solutionFeatures: [
            "Zapier trigger when jobs marked complete in their CRM",
            "Negative Feedback Shield on every review request link",
            "AI replies mentioning service type and neighborhood",
            "GBP keyword performance tracking",
        ],
        metrics: [
            { label: "Google reviews", before: "34", after: "112", change: "+229%" },
            { label: "Average rating", before: "4.0 ★", after: "4.8 ★", change: "+0.8" },
            { label: "Public 1-star reviews", before: "8/qtr", after: "2/qtr", change: "−70%" },
            { label: "Review request conversion", before: "—", after: "22%", change: "SMS" },
        ],
        quote:
            "Homeowners choose us from Google before they call. More reviews and faster responses mean we win jobs we used to lose to bigger franchises.",
        quoteAuthor: "James Ortiz",
        quoteRole: "Owner, Apex HVAC & Plumbing",
        timeline: "First 90 days on Zyene Starter",
        metaTitle: "Apex HVAC Case Study — Home Services Reputation | Zyene Reviews",
        metaDescription:
            "How Apex HVAC grew Google reviews 229% and cut public 1-star reviews 70% with Zyene review automation and the Negative Feedback Shield.",
        keywords: ["home services review management", "hvac google reviews", "zyene case study"],
    },
    {
        slug: "bellas-salon-portland",
        company: "Bella's Salon & Spa",
        industry: "Salons & Spas",
        industrySlug: "salons",
        location: "Portland, OR",
        size: "1 location · 9 stylists",
        emoji: "💇",
        headline: "Salon doubled review velocity and hit 4.9 stars in 45 days",
        excerpt: "Bella's Salon automated post-appointment review requests and used AI replies to thank every client — without spending evenings on Google.",
        challenge:
            "Stylists relied on walk-ins from Instagram but Google was an afterthought. A single viral bad review about wait times sat unanswered for three weeks. Review count stalled at 56 after two years.",
        solutionFeatures: [
            "Email + SMS review requests after appointments",
            "AI replies personalized with stylist and service names",
            "Review inbox alerts for reviews under 4 stars",
            "Website review carousel widget on booking page",
        ],
        metrics: [
            { label: "Google reviews", before: "56", after: "118", change: "+111%" },
            { label: "Average rating", before: "4.4 ★", after: "4.9 ★", change: "+0.5" },
            { label: "Monthly new reviews", before: "2–3", after: "14–18", change: "6×" },
            { label: "Owner time on reviews", before: "3 hrs/wk", after: "20 min/wk", change: "−89%" },
        ],
        quote:
            "Clients mention their stylist in reviews now because our replies feel personal — but I'm not writing them from scratch at 10pm anymore.",
        quoteAuthor: "Isabella Chen",
        quoteRole: "Owner, Bella's Salon & Spa",
        timeline: "45 days on Zyene Starter",
        metaTitle: "Bella's Salon Case Study — Salon Review Management | Zyene Reviews",
        metaDescription:
            "How Bella's Salon doubled Google review velocity and reached 4.9 stars in 45 days with Zyene automated requests and AI replies.",
        keywords: ["salon review management", "google reviews salon spa", "zyene reviews salon"],
    },
    {
        slug: "precision-auto-works-phoenix",
        company: "Precision Auto Works",
        industry: "Auto Repair",
        industrySlug: "auto-repair",
        location: "Phoenix, AZ",
        size: "1 location · 6 bays",
        emoji: "🔩",
        headline: "Auto shop went from invisible on Google to top-3 in local search",
        excerpt: "Precision Auto Works combined review requests at vehicle pickup with competitor benchmarks to close the gap with chain shops.",
        challenge:
            "Chain competitors dominated Google Maps with 300+ reviews. Precision had 19 reviews and a 3.9 average after a run of unresponded warranty complaints. The service manager had no marketing background.",
        solutionFeatures: [
            "SMS review request when keys returned at pickup",
            "Competitor tracking vs. three nearby shops",
            "Negative Feedback Shield for warranty disputes",
            "PDF monthly report for owner review",
        ],
        metrics: [
            { label: "Google reviews", before: "19", after: "94", change: "+395%" },
            { label: "Average rating", before: "3.9 ★", after: "4.6 ★", change: "+0.7" },
            { label: "Map pack position", before: "Not ranked", after: "Top 3", change: "Visible" },
            { label: "Response rate", before: "5%", after: "98%", change: "+93 pts" },
        ],
        quote:
            "We're not a franchise — but on Google we look like we belong next to them now. The competitor dashboard alone was worth it.",
        quoteAuthor: "Tom Reyes",
        quoteRole: "Service Manager, Precision Auto Works",
        timeline: "120 days on Zyene Starter",
        metaTitle: "Precision Auto Works Case Study — Auto Repair SEO | Zyene Reviews",
        metaDescription:
            "How Precision Auto Works grew Google reviews 395% and reached top-3 local map rankings with Zyene review requests and competitor tracking.",
        keywords: ["auto repair review management", "mechanic google reviews", "zyene auto repair case study"],
    },
];

export const CASE_STUDY_MAP: Record<string, CaseStudy> = Object.fromEntries(
    CASE_STUDIES.map((c) => [c.slug, c])
);

export const CASE_STUDY_SLUGS = CASE_STUDIES.map((c) => c.slug);
