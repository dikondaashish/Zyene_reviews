import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingStepStarsProps {
    rating: number | null;
    hoverRating: number | null;
    onRate: (stars: number) => void;
    onHoverRating: (stars: number | null) => void;
}

export function RatingStepStars({ rating, hoverRating, onRate, onHoverRating }: RatingStepStarsProps) {
    return (
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} out of 5 stars`}
                    aria-pressed={rating === star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => onHoverRating(star)}
                    onMouseLeave={() => onHoverRating(null)}
                    className={cn(
                        "flex min-h-12 min-w-0 items-center justify-center rounded-lg p-1 transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "hover:scale-110 active:scale-95"
                    )}
                >
                    <Star
                        className={cn(
                            "size-9 sm:size-12 transition-colors duration-200",
                            (hoverRating !== null ? star <= hoverRating : rating !== null && star <= rating)
                                ? "fill-chart-4 text-chart-4"
                                : "fill-muted text-muted-foreground/40 dark:fill-[rgb(51,65,85)] dark:text-[rgb(100,116,139)]"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}
