import { NewsletterSignup } from "@/components/marketing/newsletter-signup";
import { Download, Mail } from "lucide-react";

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
                <p className="text-muted-foreground text-sm sm:text-base mb-1">
                    Send me the 20 templates — we&apos;ll email the review request swipe file (PDF delivery coming in a
                    later update).
                </p>
                <p className="text-xs text-muted-foreground mb-6 flex items-center justify-center gap-1.5">
                    <Mail className="size-3.5 shrink-0" aria-hidden />
                    Download the review request swipe file to your inbox
                </p>

                <NewsletterSignup
                    source="review_request_templates"
                    submitLabel="Send me the 20 templates"
                    subscribedLabel="On the list"
                    successMessage="You're on the list. Check your inbox for a welcome note—we'll send the full swipe file soon (PDF download is a Phase 5 follow-up)."
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
