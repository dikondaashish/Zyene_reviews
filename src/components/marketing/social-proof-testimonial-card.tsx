import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TestimonialCard } from "@/lib/social-proof/social-proof-data";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function SocialProofTestimonialCard({ t }: { t: TestimonialCard }) {
    const study = CASE_STUDY_MAP[t.caseStudySlug];
    if (!study) return null;
    return <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-medium text-muted-foreground">Illustrative workflow</p>
        <h3 className="mt-3 font-semibold">{study.headline}</h3>
        <p className="mt-3 flex-1 text-sm text-muted-foreground">{study.excerpt}</p>
        <Link href={`/case-studies/${study.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
            Explore the workflow <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
    </article>;
}
