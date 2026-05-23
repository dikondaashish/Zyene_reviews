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
        <div className="flex justify-center gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => onHoverRating(star)}
                    onMouseLeave={() => onHoverRating(null)}
                    className={cn(
                        "p-2 transition-transform duration-200 focus:outline-none",
                        "hover:scale-110 active:scale-95"
                    )}
                >
                    <Star
                        className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 transition-colors duration-200",
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
