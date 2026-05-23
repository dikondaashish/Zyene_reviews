import { cn } from "@/lib/utils";
import { RATINGS } from "@/app/r/[slug]/review-flow/types";

export interface RatingStepEmojiProps {
    rating: number | null;
    hoverRating: number | null;
    onRate: (stars: number) => void;
    onHoverRating: (stars: number | null) => void;
}

export function RatingStepEmoji({ rating, hoverRating, onRate, onHoverRating }: RatingStepEmojiProps) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {RATINGS.map((r) => (
                <button
                    key={r.value}
                    onClick={() => onRate(r.value)}
                    onMouseEnter={() => onHoverRating(r.value)}
                    onMouseLeave={() => onHoverRating(null)}
                    className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300",
                        "border-2 hover:border-primary/40 hover:bg-primary/10",
                        "focus:outline-none focus:ring-2 focus:ring-primary/40",
                        rating !== r.value && "active:scale-95",
                        hoverRating === r.value && rating !== r.value
                            ? "border-primary/50 bg-primary/10 scale-105 shadow-md"
                            : rating === r.value
                                ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-md scale-105 z-10"
                                : "border-border bg-background dark:border-white/10 dark:bg-[rgb(30,41,59)]"
                    )}
                >
                    <span
                        className={cn(
                            "text-3xl sm:text-4xl transition-all duration-500",
                            hoverRating === r.value && rating !== r.value && "scale-110 ease-out",
                            rating === r.value
                                ? "scale-[1.6] sm:scale-[1.8] -translate-y-2 drop-shadow-2xl ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20 relative"
                                : "ease-out"
                        )}
                    >
                        {r.emoji}
                    </span>
                    <span
                        className={cn(
                            "text-[10px] sm:text-xs font-semibold tracking-tight transition-all duration-300",
                            hoverRating === r.value || rating === r.value
                                ? "text-primary"
                                : "text-muted-foreground",
                            rating === r.value && "opacity-0"
                        )}
                    >
                        {r.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
