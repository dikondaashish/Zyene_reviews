import { NewsletterSignup } from "@/components/marketing/newsletter-signup";
import type { ResourceGuide } from "@/lib/content/resource-data";
import { Download, ListChecks } from "lucide-react";

const REVIEW_COMPLIANCE_ITEMS = [
    "No discounts, gifts, or incentives for positive reviews.",
    "Do not ask only happy customers for reviews—keep outreach fair and honest.",
    "One polite follow-up per visit is enough; do not pressure people with repeated messages.",
] as const;

const CHECKLIST_COMPLIANCE_ITEMS = [
    "Review requests must be fair—do not gate unhappy customers away from Google.",
    "No incentives tied to star ratings or review text.",
    "Use private feedback to resolve issues, not to suppress public criticism.",
] as const;

function leadCopy(slug: string): {
    badge: string;
    heading: string;
    description: string;
    source: string;
    submitLabel: string;
    successMessage: string;
    compliance: readonly string[];
    footerNote: string;
} {
    if (slug === "local-seo-checklist") {
        return {
            badge: "Free checklist",
            heading: "Get the checklist by email",
            description:
                "We'll send a link to this page so you can work through all 40+ local SEO items. No PDF yet—the full checklist lives on this page.",
            source: "local_seo_checklist",
            submitLabel: "Email me the checklist",
            successMessage: "Check your inbox for the checklist link. You can also use the checklist on this page now.",
            compliance: CHECKLIST_COMPLIANCE_ITEMS,
            footerNote: "The full checklist stays on this page for search and AI crawlers—no login required.",
        };
    }
    return {
        badge: "Free swipe file",
        heading: "Get the full template pack",
        description:
            "Send me the 20 templates — we'll email a link to the full web swipe file (22 SMS and email scripts). No PDF yet; everything is ready on the page below.",
        source: "review_request_templates",
        submitLabel: "Send me the 20 templates",
        successMessage:
            "Check your email for the template pack link. The full web version is also available on this page.",
        compliance: REVIEW_COMPLIANCE_ITEMS,
        footerNote:
            "Preview templates stay on this page for search and AI crawlers—no login required to read or copy them here.",
    };
}

export function ResourcesGuideTemplatePackLeadSection({ resource }: { resource: ResourceGuide }) {
    const copy = leadCopy(resource.slug);
    const Icon = resource.slug === "local-seo-checklist" ? ListChecks : Download;

    return (
        <section
            id="resource-lead-capture"
            className="py-10 px-4 border-b border-border bg-gradient-to-b from-primary/5 to-background"
            aria-labelledby="resource-lead-capture-heading"
        >
            <div className="container mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                    <Icon className="size-3.5" aria-hidden />
                    {resource.resourceLabel ?? copy.badge}
                </div>
                <h2 id="resource-lead-capture-heading" className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {copy.heading}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base mb-6">{copy.description}</p>

                <NewsletterSignup
                    source={copy.source}
                    submitLabel={copy.submitLabel}
                    subscribedLabel="On the list"
                    successMessage={copy.successMessage}
                    idleFooter=""
                    className="mx-auto"
                />

                <ul className="mt-6 text-left max-w-lg mx-auto space-y-2 text-xs text-muted-foreground">
                    {copy.compliance.map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className="text-primary shrink-0" aria-hidden>
                                •
                            </span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4 max-w-lg mx-auto">{copy.footerNote}</p>
            </div>
        </section>
    );
}
