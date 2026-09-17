import type { CaseStudy } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugResultsSection({ study }: { study: CaseStudy }) {
    return <section id="results" className="marketing-section scroll-mt-24 border-b border-border">
        <div className="marketing-container space-y-6">
            <p className="marketing-eyebrow">03 / Check your own results</p>
            <h2 className="text-3xl font-bold">Measure the routine, then improve it</h2>
            <p className="max-w-2xl text-muted-foreground">For your {study.industry.toLowerCase()} business, compare the same date range before and after changing the workflow. These are measures to track, not promised results.</p>
            <ul className="grid gap-4 md:grid-cols-3">
                {["Requests sent, delivered, and completed", "Reviews with a published business reply", "Recent feedback themes and resolved concerns"].map(label => <li key={label} className="rounded-xl border border-border p-5">{label}</li>)}
            </ul>
            <p className="text-sm text-muted-foreground">Request completion includes private feedback or a Google handoff. A click does not confirm that Google published a review.</p>
        </div>
    </section>;
}
