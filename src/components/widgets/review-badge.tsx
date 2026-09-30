"use client";

import { FractionalStar } from "@/components/ui/fractional-star";

export function ReviewBadge({
    businessName,
    avgRating,
    totalReviews,
    reviewsUrl,
}: {
    businessName: string;
    avgRating: number;
    totalReviews: number;
    reviewsUrl: string;
}) {
    const safeAvg = Number.isFinite(avgRating) ? avgRating : 0;
    const rating = Math.max(0, Math.min(5, safeAvg));

    return (
        <div className="flex min-h-[220px] w-full items-center justify-center bg-transparent p-4 font-sans">
            <div className="w-full max-w-[520px] rounded-xl border border-border bg-card px-4 py-5 text-center shadow-sm">
                <p className="mb-3 text-sm font-semibold text-foreground break-words">{businessName}</p>

                <div className="mb-5 flex items-center justify-center flex-wrap gap-3">
                    <span className="text-4xl font-semibold tracking-tight text-foreground">{rating.toFixed(1)}</span>
                    <div
                        className="flex items-center gap-1"
                        aria-label={`${rating.toFixed(1)} out of 5 stars`}
                    >
                        {Array.from({ length: 5 }).map((_, i) => (
                            <FractionalStar
                                key={i}
                                fill={Math.min(1, Math.max(0, rating - i))}
                                starClassName="size-6 sm:size-7"
                            />
                        ))}
                    </div>
                </div>

                <p className="text-center text-sm text-foreground">
                    <a
                        href={reviewsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-primary bg-transparent border-0 p-0 font-medium text-primary focus-visible:outline-2 focus-visible:outline-ring"
                        title={businessName}
                    >
                        {totalReviews > 0 ? `Read our ${totalReviews.toLocaleString()} reviews` : "No reviews yet"}
                    </a>
                </p>
            </div>
        </div>
    );
}
