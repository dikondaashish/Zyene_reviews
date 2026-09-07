import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugRelatedSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    return (
        <section className="py-16 sm:py-20">
            <div className="container mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-8 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Ready to build trust?</p>
                    <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Get results like {study.company}</h2>
                    <p className="mt-4 max-w-lg text-lg text-muted-foreground">Start a 7-day free trial with the same features and no annual contract.</p>
                </div>
                <div className="flex flex-col items-start gap-4 md:items-end">
                    <Link href="https://auth.zyenereviews.com/signup" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        Start your free trial <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <Link href={`/industries/${study.industrySlug}`} className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        See Zyene Reviews for {study.industry}
                    </Link>
                </div>
            </div>
        </section>
    );
}
