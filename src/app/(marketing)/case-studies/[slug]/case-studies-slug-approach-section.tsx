import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesSlugApproachSection({ study, slug, related }: { study: (typeof CASE_STUDY_MAP)[string]; slug: string; related: (typeof CASE_STUDY_MAP)[string][] }) {
    return (
        <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">The solution</h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                            {study.company} implemented Zyene Reviews with these capabilities:
                        </p>
                        <ul className="space-y-3">
                            {study.solutionFeatures.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                                    <Check className="text-primary shrink-0 mt-0.5 size-5" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
    );
}
