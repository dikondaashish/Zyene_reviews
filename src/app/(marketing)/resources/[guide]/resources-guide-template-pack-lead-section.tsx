import { NewsletterSignup } from "@/components/marketing/newsletter-signup";
import { Download } from "lucide-react";

const COMPLIANCE_ITEMS = [
    "No discounts, gifts, or incentives for positive reviews.",
    "Do not ask only happy customers for reviews—keep outreach fair and honest.",
    "One polite follow-up per visit is enough; do not pressure people with repeated messages.",
] as const;

export function ResourcesGuideTemplatePackLeadSection() {
    return (
        <section
            id="template-pack-capture"
            className="py-10 px-4 border-b border-border bg-gradient-to-b from-primary/5 to-background"
            aria-labelledby="template-pack-capture-heading"
        >
            <div className="container mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4">
                    <Download className="size-3.5" aria-hidden />
                    Free swipe file
                </div>
                <h2 id="template-pack-capture-heading" className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    Get the full template pack
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base mb-6">
                    Send me the 20 templates — we&apos;ll email a link to the full web swipe file (22 SMS and email
                    scripts). No PDF yet; everything is ready on the page below.
                </p>

                <NewsletterSignup
                    source="review_request_templates"
                    submitLabel="Send me the 20 templates"
                    subscribedLabel="On the list"
                    successMessage="Check your email for the template pack link. The full web version is also available on this page."
                    idleFooter=""
                    className="mx-auto"
                />

                <ul className="mt-6 text-left max-w-lg mx-auto space-y-2 text-xs text-muted-foreground">
                    {COMPLIANCE_ITEMS.map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className="text-primary shrink-0" aria-hidden>
                                •
                            </span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4 max-w-lg mx-auto">
                    Preview templates stay on this page for search and AI crawlers—no login required to read or copy
                    them here.
                </p>
            </div>
        </section>
    );
}
