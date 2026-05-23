import { NewsletterSignup } from "@/components/marketing/newsletter-signup";
import { NEWSLETTER_DESCRIPTION } from "@/lib/phase6/email-sequences-data";

export function PartnersCtaSection() {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-2">{NEWSLETTER_DESCRIPTION.title}</h2>
                    <p className="text-muted-foreground mb-2">{NEWSLETTER_DESCRIPTION.frequency}</p>
                    <p className="text-sm text-muted-foreground mb-8">
                        {NEWSLETTER_DESCRIPTION.topics.join(" · ")}
                    </p>
                    <NewsletterSignup source="partners_page" />
                </div>
            </section>
    );
}
