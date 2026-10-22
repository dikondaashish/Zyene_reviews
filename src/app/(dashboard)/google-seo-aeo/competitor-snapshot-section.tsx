import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import { SeoSection } from "./seo-section";

type Comparison = { text: string; ahead: boolean };

/** One plain sentence per competitor, so a manager does not have to compare columns in their head. */
function compareToYou(rating: number, reviews: number, yourRating: number, yourReviews: number): Comparison {
    if (rating > yourRating + 0.05) return { text: "Higher rating than you", ahead: true };
    if (reviews > yourReviews) return { text: `${(reviews - yourReviews).toLocaleString()} more reviews than you`, ahead: true };
    return { text: "You are ahead", ahead: false };
}

export function CompetitorSnapshotSection({ content }: { content: GoogleSeoAeoContentProps }) {
    const you = { rating: content.googleAvgLive, reviews: content.googleCountLive };

    return (
        <SeoSection
            id="competitor-snapshot-title"
            title="How you compare on Google"
            description="Star rating and review count for the competitors you track, next to yours."
            actions={
                <Button asChild size="sm" variant="ghost">
                    <Link href="/competitors">Manage competitors</Link>
                </Button>
            }
        >
            {content.competitors.length === 0 ? (
                <div className="flex flex-col items-start gap-3 px-5 py-6 sm:px-6">
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        Add two or three nearby businesses you compete with. We will show how your rating, reviews, and
                        AI mentions stack up against theirs.
                    </p>
                    <Button asChild size="sm" variant="outline">
                        <Link href="/competitors">Add competitors</Link>
                    </Button>
                </div>
            ) : (
                <ul className="divide-y divide-border">
                    <li className="flex items-center justify-between gap-4 bg-primary/5 px-5 py-3.5 sm:px-6">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">You ({content.businessName})</p>
                            <RatingLine rating={you.rating} reviews={you.reviews} />
                        </div>
                    </li>
                    {content.competitors.map((c) => {
                        const rating = Number(c.average_rating || 0);
                        const reviews = c.total_reviews || 0;
                        const comparison = compareToYou(rating, reviews, you.rating, you.reviews);
                        return (
                            <li
                                key={c.id}
                                className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                                    <RatingLine rating={rating} reviews={reviews} />
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-xs font-medium",
                                            comparison.ahead
                                                ? "bg-warning/15 text-warning-foreground"
                                                : "bg-success/10 text-success",
                                        )}
                                    >
                                        {comparison.text}
                                    </span>
                                    {c.google_url ? (
                                        <Button asChild size="sm" variant="ghost">
                                            <a href={c.google_url} target="_blank" rel="noopener noreferrer">
                                                View on Google <ExternalLink className="size-3.5" />
                                            </a>
                                        </Button>
                                    ) : null}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </SeoSection>
    );
}

function RatingLine({ rating, reviews }: { rating: number; reviews: number }) {
    return (
        <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star className="size-3.5 fill-current text-warning" aria-hidden />
            {rating.toFixed(1)} · {reviews.toLocaleString()} reviews
        </p>
    );
}
