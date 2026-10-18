import { getPlanHighlights } from "@/lib/marketing/pricing-plan-highlights";
import { TRIAL_DETAILS } from "@/lib/marketing/trial-copy";
import { PLANS } from "@/services/stripe/plan-catalog";

/**
 * Facts the website assistant may state. Prices and plan limits are read from the
 * billing catalog so the bot can never quote a number the checkout disagrees with.
 */
function pricingFacts(): string {
    const lines = PLANS.map((plan) => {
        const price = plan.price === null
            ? "custom pricing (talk to sales)"
            : `$${plan.price.toFixed(2)} per ${plan.interval}`;
        const cadence = plan.interval ? ` (${plan.interval === "year" ? "yearly" : "monthly"})` : "";
        return `- ${plan.name}${cadence}: ${price}. Includes: ${getPlanHighlights(plan).join("; ")}.`;
    });
    return [
        ...new Set(lines),
        "- Yearly billing saves about 17% compared with paying monthly.",
        `- Trial: ${TRIAL_DETAILS}`,
    ].join("\n");
}

const PRODUCT_FACTS = `
Zyene Reviews (by Zyene, Inc., San Francisco) is AI-powered review management for local businesses and agencies.

Collect reviews
- Review page: customers scan a QR code or tap an NFC review stand, rate the visit, pick what they liked, and get an AI-drafted review they can edit, copy and post on Google themselves. Lower ratings go to a private feedback form so the owner can fix the issue first.
- Printable or downloadable QR codes, and NFC review stands ordered inside the app.
- Review requests by SMS, email or both; customer list with notes and CSV import/export.
- Campaigns with Post-Visit, Appointment Follow-up and Re-engagement templates; POS triggers (Square early access, Clover).

Respond
- One reviews inbox for Google, Facebook and Yelp.
- AI reply suggestions in Professional, Friendly or Concise tone.
- Automatic replies to new Google reviews by star threshold (3+, 4+ or 5 only) and tone.

Understand and grow
- Smart Insights: key themes from reviews and suggested improvements; broken-link checks on the Google Business Profile.
- Analytics: new reviews, average rating, response rate, request funnel by channel, PDF and CSV export.
- Competitor tracking: rating and review volume comparison, Google search terms, AI market positioning brief, threshold alerts.
- Google SEO and AEO: Google profile score and audit, prompt tracking across AI assistants such as ChatGPT, Perplexity and Gemini, share of voice, llms.txt and NAP directory tools.
- Website review widgets (20 templates), REST API and Zapier-compatible webhooks.
- Multi-location: one organization with many businesses; built for agencies too.

Policies
- Zyene never writes or posts fake reviews. Customers always post their own reviews themselves; AI only suggests a draft they can edit.
- Review gating (only asking happy customers to post) is not how the product works: every customer can still post publicly; low ratings are simply offered a private channel too.
- Data is protected with Supabase row-level security; payments are handled by Stripe.

Useful pages (link with relative paths)
- Pricing: /pricing · Features: /features · How it works: /how-it-works · Integrations: /integrations
- Industries: /industries · Compare with other tools: /compare · Case studies: /case-studies
- Book a demo: /demo · Contact: /contact · Help center: /help · Free tools: /tools · Security: /security
- Start a trial: /signup

Contact
- Sales and general: contact@zyenereviews.com · Support: support@zyenereviews.com
`.trim();

export function buildSupportKnowledge(): string {
    return `${PRODUCT_FACTS}\n\nPricing (authoritative)\n${pricingFacts()}`;
}
