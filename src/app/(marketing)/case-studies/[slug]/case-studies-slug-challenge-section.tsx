import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesSlugChallengeSection({ study, slug, related }: { study: (typeof CASE_STUDY_MAP)[string]; slug: string; related: (typeof CASE_STUDY_MAP)[string][] }) {
    return (
        <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">The challenge</h2>
                        <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                    </section>
    );
}
