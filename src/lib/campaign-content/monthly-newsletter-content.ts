// Rotating content blocks for the monthly marketing newsletter cron

export interface MonthlyNewsletterEdition {
    productUpdate: string;
    tipTitle: string;
    tipBody: string;
    caseStudySlug: string;
    caseStudyTitle: string;
}

export const MONTHLY_NEWSLETTER_EDITIONS: MonthlyNewsletterEdition[] = [
    {
        productUpdate:
            "Industry landing pages, case studies, and partner program are live - plus improved trial email guides for new signups.",
        tipTitle: "Respond to every Google review within 24 hours",
        tipBody:
            "A timely, thoughtful reply shows customers that you listen to their feedback. Use AI reply suggestions to stay consistent without spending evenings on Google.",
        caseStudySlug: "sunrise-dental-austin",
        caseStudyTitle: "How Sunrise Dental grew from 23 to 89 Google reviews",
    },
    {
        productUpdate:
            "Competitor watch alerts and GBP SEO dashboards continue to improve - check your dashboard for new benchmark insights.",
        tipTitle: "Send review requests after a customer visit",
        tipBody:
            "Send a clear request while the experience is still fresh, and invite honest feedback from every customer. Automate the timing with Zyene campaigns.",
        caseStudySlug: "wolfpack-bbq-charlotte",
        caseStudyTitle: "Wolfpack BBQ added 64 five-star reviews in 60 days",
    },
    {
        productUpdate:
            "Negative Feedback Shield gives low ratings a private feedback path and alerts your team - included on every paid plan.",
        tipTitle: "Track competitors on Google Maps",
        tipBody:
            "Add nearby businesses in Zyene to see how many reviews you need to catch the market leader in your category.",
        caseStudySlug: "apex-hvac-denver",
        caseStudyTitle: "Apex HVAC grew reviews 229% and cut public 1-stars",
    },
];

export function getMonthlyNewsletterEdition(date = new Date()): MonthlyNewsletterEdition {
    const index = date.getMonth() % MONTHLY_NEWSLETTER_EDITIONS.length;
    return MONTHLY_NEWSLETTER_EDITIONS[index];
}
