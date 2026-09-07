import { Quote } from "lucide-react";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugQuoteSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    return (
        <section className="border-b border-border bg-primary/5 py-16 sm:py-20">
            <div className="container mx-auto grid max-w-6xl gap-8 px-4 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                <div className="flex items-start gap-3">
                    <Quote className="mt-1 size-8 shrink-0 text-primary" aria-hidden="true" />
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">A useful outcome</p>
                </div>
                <div>
                    <blockquote className="max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">“{study.quote}”</blockquote>
                    <footer className="mt-8 border-t border-primary/20 pt-4">
                        <p className="text-xs text-muted-foreground">Illustrative quote, composite persona, not a verified customer statement.</p>
                        <p className="mt-2 font-semibold text-foreground">{study.quoteAuthor}</p>
                        <p className="text-sm text-muted-foreground">{study.quoteRole}</p>
                    </footer>
                </div>
            </div>
        </section>
    );
}
