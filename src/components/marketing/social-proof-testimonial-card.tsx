import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { TestimonialCard } from "@/lib/phase5/social-proof-data";

export function SocialProofTestimonialCard({ t }: { t: TestimonialCard }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full hover:border-primary/30 transition-colors">
            <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
            </div>
            <p className="text-sm text-foreground leading-relaxed flex-1 mb-5">&ldquo;{t.quote}&rdquo;</p>
            <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">{t.author}</p>
                <p className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                </p>
                <Link
                    href={`/case-studies/${t.caseStudySlug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-2 hover:brightness-90"
                >
                    Read case study <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
}
