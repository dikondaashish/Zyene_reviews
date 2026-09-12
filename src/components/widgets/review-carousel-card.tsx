import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CarouselReview } from "./review-carousel-types";
import { GoogleLogoIcon } from "./review-carousel-google-logo";

export function ReviewCarouselCard({
    review,
    mounted,
}: {
    review: CarouselReview;
    mounted: boolean;
}) {
    return (
        <div className="flex-none w-[min(280px,calc(100vw-3rem))] sm:w-[320px] bg-card rounded-xl border border-border p-4 flex flex-col gap-3 transition-transform hover:-translate-y-1 cursor-default">
            <div className="flex justify-between items-start">
                <div className="flex -space-x-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            aria-hidden="true"
                            className={cn(
                                "size-4",
                                i < review.rating ? "fill-chart-4 text-chart-4" : "fill-muted text-muted-foreground/40"
                            )}
                        />
                    ))}
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {review.platform.toLowerCase() === "google" ? <GoogleLogoIcon /> : review.platform}
                </span>
            </div>

            <p className="text-sm text-foreground leading-relaxed flex-1">
                {review.content ? `“${review.content}”` : "This customer left a rating without a written review."}
            </p>

            {review.external_url && (
                <a
                    href={review.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-xs font-medium text-primary underline underline-offset-2"
                >
                    View original review
                </a>
            )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <span className="font-semibold text-sm text-foreground truncate">
                    {review.author_name || "Valued Customer"}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {mounted ? new Date(review.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' }) : "-"}
                </span>
            </div>
        </div>
    );
}
