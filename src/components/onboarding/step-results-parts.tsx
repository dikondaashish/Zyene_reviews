import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingResults } from "@/app/actions/onboarding/results";

const fmt = (n: number) => n.toLocaleString("en-US");

export function ResultsStats({ results }: { results: OnboardingResults }) {
    const stats = [
        { label: "Google rating", value: results.averageRating.toFixed(1), star: true },
        { label: "Reviews", value: fmt(results.total) },
        { label: "No reply yet", value: fmt(results.unanswered) },
        { label: "Unhappy, no reply", value: fmt(results.unhappy), alert: results.unhappy > 0 },
    ];
    return (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-card px-4 py-3">
                    <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                    <dd className={cn("mt-1 flex items-center gap-1 text-xl font-semibold tabular-nums", stat.alert ? "text-destructive" : "text-foreground")}>
                        {stat.value}
                        {stat.star && <Star className="size-4 text-warning" aria-hidden />}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function UnhappySamples({ results }: { results: OnboardingResults }) {
    if (results.samples.length === 0) return null;
    return (
        <section aria-labelledby="unhappy-samples-title" className="space-y-2">
            <h2 id="unhappy-samples-title" className="ui-section-title">Unhappy reviews waiting for a reply</h2>
            <ul className="space-y-2">
                {results.samples.map((review) => (
                    <li key={review.id} className="rounded-lg border border-border bg-background px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-medium text-foreground">{review.author}</span>
                            <span className="flex shrink-0" aria-label={`${review.rating} out of 5 stars`}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star key={i} className={cn("size-3.5", i < review.rating ? "text-warning" : "text-muted-foreground/25")} aria-hidden />
                                ))}
                            </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {review.text || "No written comment, just the star rating."}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
