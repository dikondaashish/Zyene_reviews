import { Check, Loader2, Star } from "lucide-react";
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
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
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
            <h2 id="unhappy-samples-title" className="ui-section-title text-foreground">Unhappy reviews waiting for a reply</h2>
            <ul className="space-y-2">
                {results.samples.map((review) => (
                    <li key={review.id} className="rounded-lg border border-border bg-card px-4 py-3">
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

const IMPORT_STEPS = ["Connected to your Google Business Profile", "Importing your reviews", "Finding reviews that still need a reply", "Working out your rating"];

/** The import narrated as it happens, instead of a bare spinner. */
export function ImportProgress({ waitedLong }: { waitedLong: boolean }) {
    return (
        <div role="status" className="space-y-4">
            <ol className="space-y-3">
                {IMPORT_STEPS.map((label, i) => (
                    <li key={label} className="flex items-center gap-3 text-sm">
                        <span
                            className={cn(
                                "grid size-6 shrink-0 place-items-center rounded-full border",
                                i === 0 && "border-success bg-success text-white",
                                i === 1 && "border-primary text-primary",
                                i > 1 && "border-border",
                            )}
                            aria-hidden
                        >
                            {i === 0 ? <Check className="size-3.5" /> : i === 1 ? <Loader2 className="size-3.5 animate-spin" /> : null}
                        </span>
                        <span className={i > 1 ? "text-muted-foreground" : "font-medium text-foreground"}>{label}{i === 1 ? "…" : ""}</span>
                    </li>
                ))}
            </ol>
            <p className="text-xs text-muted-foreground">
                {waitedLong
                    ? "This is taking longer than usual. Carry on and I'll finish in the background."
                    : "This usually takes under a minute. You can carry on whenever you like."}
            </p>
        </div>
    );
}
