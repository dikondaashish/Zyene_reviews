import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterSignup } from "@/components/marketing/newsletter-signup";

export function BlogNewsletterCtaSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-3">Get the latest guides in your inbox</h2>
                    <p className="text-muted-foreground mb-8">Monthly digest of our best posts on Google reviews, local SEO, and reputation management.</p>
                    <NewsletterSignup source="blog" />
                </div>
            </section>
    );
}
