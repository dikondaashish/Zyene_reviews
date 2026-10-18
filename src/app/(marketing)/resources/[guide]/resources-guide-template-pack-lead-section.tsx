import { NewsletterSignup } from "@/components/marketing/newsletter-signup";
import type { ResourceGuide } from "@/lib/content/resource-data";
import { Check, Download, ListChecks } from "lucide-react";

const REVIEW_COMPLIANCE_ITEMS = [
    "No discounts, gifts, or incentives for positive reviews.",
    "Use outreach language that matches your business's documented review process.",
    "One polite follow-up per visit is enough; do not pressure people with repeated messages.",
] as const;

const CHECKLIST_COMPLIANCE_ITEMS = [
    "Set request messaging and routing to match your documented customer-feedback process.",
    "No incentives tied to star ratings or review text.",
    "Use private feedback to organize timely service recovery.",
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
                "We'll send a link to this page so you can work through all 40+ local SEO items. No PDF yet - the full checklist lives on this page.",
            source: "local_seo_checklist",
            submitLabel: "Email me the checklist",
            successMessage: "Check your inbox for the checklist link. You can also use the checklist on this page now.",
            compliance: CHECKLIST_COMPLIANCE_ITEMS,
            footerNote: "The full checklist stays on this page for search and AI crawlers - no login required.",
        };
    }
    return {
        badge: "Free swipe file",
        heading: "Get the full template pack",
        description:
            "Send me the 20 templates - we'll email a link to the full web swipe file (22 SMS and email scripts). No PDF yet; everything is ready on the page below.",
        source: "review_request_templates",
        submitLabel: "Send me the 20 templates",
        successMessage:
            "Check your email for the template pack link. The full web version is also available on this page.",
        compliance: REVIEW_COMPLIANCE_ITEMS,
        footerNote:
            "Preview templates stay on this page for search and AI crawlers - no login required to read or copy them here.",
    };
}

export function ResourcesGuideTemplatePackLeadSection({ resource }: { resource: ResourceGuide }) {
    const copy = leadCopy(resource.slug);
    const Icon = resource.slug === "local-seo-checklist" ? ListChecks : Download;

    return (
        <section
            id="resource-lead-capture"
            className="marketing-section mi-section-tight"
            aria-labelledby="resource-lead-capture-heading"
        >
            <div className="marketing-container">
                <div className="mi-panel mi-lead">
                    <div>
                        <p className="mi-pill">
                            <Icon size={14} aria-hidden="true" />
                            {resource.resourceLabel ?? copy.badge}
                        </p>
                        <h2 id="resource-lead-capture-heading">{copy.heading}</h2>
                        <p className="mi-lead-note">{copy.description}</p>
                        <NewsletterSignup
                            source={copy.source}
                            submitLabel={copy.submitLabel}
                            subscribedLabel="On the list"
                            successMessage={copy.successMessage}
                            idleFooter=""
                            className="mi-lead-form"
                        />
                    </div>
                    <div>
                        <ul className="mi-checks">
                            {copy.compliance.map((item) => (
                                <li key={item}>
                                    <Check size={16} aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="mi-lead-note">{copy.footerNote}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
