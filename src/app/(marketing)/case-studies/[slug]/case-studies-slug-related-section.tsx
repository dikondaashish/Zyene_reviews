import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesSlugRelatedSection({ study, slug, related }: { study: (typeof CASE_STUDY_MAP)[string]; slug: string; related: (typeof CASE_STUDY_MAP)[string][] }) {
    return (
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Get results like {study.company}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Start your 7-day free trial ,  same features, no annual contract.
                        </p>
                        <Link href={SIGNUP_URL}>
                            <Button size="lg" className="px-10 py-6 font-semibold rounded-xl">
                                Start Your Free Trial <ArrowRight className="ml-2 size-5" />
                            </Button>
                        </Link>
                        <p className="mt-4">
                            <Link
                                href={`/industries/${study.industrySlug}`}
                                className="text-sm text-primary font-medium hover:brightness-90"
                            >
                                See Zyene for {study.industry} →
                            </Link>
                        </p>
                    </section>
    );
}
