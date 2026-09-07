import { Check } from "lucide-react";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugApproachSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    return (
        <section className="bg-muted/35 py-16 sm:py-20">
            <div className="container mx-auto grid max-w-6xl gap-10 px-4 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">02 / The approach</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The solution</h2>
                </div>
                <div>
                    <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{study.company} implemented Zyene Reviews with a simple workflow that fit the team’s existing job-completion process.</p>
                    <ul className="mt-8 grid gap-0 divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:border-y-0 sm:border-l">
                        {study.solutionFeatures.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 border-border py-4 text-base leading-relaxed text-foreground sm:px-5 sm:py-5">
                                <Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
