import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FEATURED_TESTIMONIALS } from "@/lib/phase5/social-proof-data";
import { SocialProofTestimonialCard } from "./social-proof-testimonial-card";

export function TestimonialGrid({
    title = "What local business owners say",
    subtitle = "Real outcomes from restaurants, dental practices, home services, and more.",
    limit,
}: {
    title?: string;
    subtitle?: string;
    limit?: number;
}) {
    const items = limit ? FEATURED_TESTIMONIALS.slice(0, limit) : FEATURED_TESTIMONIALS;
    return (
        <section className="w-full py-20 px-4 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {items.map((t) => (
                        <SocialProofTestimonialCard key={t.caseStudySlug} t={t} />
                    ))}
                </div>
                <div className="text-center mt-10">
                    <Link
                        href="/case-studies"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-90"
                    >
                        View all case studies <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
