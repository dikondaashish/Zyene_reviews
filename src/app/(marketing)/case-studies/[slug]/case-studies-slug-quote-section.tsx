import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesSlugQuoteSection({ study, slug, related }: { study: (typeof CASE_STUDY_MAP)[string]; slug: string; related: (typeof CASE_STUDY_MAP)[string][] }) {
    return (
        <section className="bg-muted border border-border rounded-2xl p-8 relative">
                        <Quote className="text-primary/30 absolute top-6 left-6 size-8" />
                        <blockquote className="text-lg text-foreground leading-relaxed pl-10 mb-6">
                            &ldquo;{study.quote}&rdquo;
                        </blockquote>
                        <footer className="pl-10 border-t border-border pt-4">
                            <p className="text-xs text-muted-foreground mb-2">Illustrative quote — composite persona, not a verified customer statement.</p>
                            <p className="font-semibold text-foreground">{study.quoteAuthor}</p>
                            <p className="text-sm text-muted-foreground">{study.quoteRole}</p>
                        </footer>
                    </section>
    );
}
