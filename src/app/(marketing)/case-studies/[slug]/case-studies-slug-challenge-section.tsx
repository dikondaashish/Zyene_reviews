import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugChallengeSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    return (
        <section className="border-b border-border py-16 sm:py-20">
            <div className="container mx-auto grid max-w-6xl gap-6 px-4 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">01 / The starting point</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The challenge</h2>
                </div>
                <p className="max-w-3xl text-xl leading-relaxed text-muted-foreground">{study.challenge}</p>
            </div>
        </section>
    );
}
