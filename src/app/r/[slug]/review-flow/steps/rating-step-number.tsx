import { cn } from "@/lib/utils";

export interface RatingStepNumberProps {
    rating: number | null;
    hoverRating: number | null;
    onRate: (stars: number) => void;
    onHoverRating: (stars: number | null) => void;
}

export function RatingStepNumber({ rating, hoverRating, onRate, onHoverRating }: RatingStepNumberProps) {
    return (
        <div className="flex justify-between w-full max-w-sm mx-auto">
            {[1, 2, 3, 4, 5].map((num) => (
                <button
                    key={num}
                    onClick={() => onRate(num)}
                    onMouseEnter={() => onHoverRating(num)}
                    onMouseLeave={() => onHoverRating(null)}
                    className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-lg sm:text-xl font-bold transition-all duration-200 shadow-sm",
                        "border-2 focus:outline-none focus:ring-2 focus:ring-primary/40",
                        rating === num
                            ? "border-primary bg-primary text-primary-foreground scale-110 shadow-md ring-4 ring-primary/20 z-10"
                            : hoverRating === num
                                ? "border-primary/50 bg-primary/10 text-primary scale-105"
                                : "border-border bg-background text-muted-foreground hover:border-foreground/30 dark:border-white/10 dark:bg-[rgb(30,41,59)]"
                    )}
                >
                    {num}
                </button>
            ))}
        </div>
    );
}
