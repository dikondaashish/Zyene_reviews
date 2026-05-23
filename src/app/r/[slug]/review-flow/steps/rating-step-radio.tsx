import { cn } from "@/lib/utils";
import { RATINGS } from "@/app/r/[slug]/review-flow/types";

export interface RatingStepRadioProps {
    rating: number | null;
    onRate: (stars: number) => void;
}

export function RatingStepRadio({ rating, onRate }: RatingStepRadioProps) {
    return (
        <div className="flex flex-col gap-2.5 max-w-sm mx-auto w-full">
            {RATINGS.map((r) => (
                <button
                    key={r.value}
                    onClick={() => onRate(r.value)}
                    className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 w-full text-left",
                        "focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-[0.98]",
                        rating === r.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-background hover:border-primary/40 hover:bg-muted dark:border-white/10 dark:bg-[rgb(30,41,59)] dark:hover:bg-[rgb(51,65,85)]"
                    )}
                >
                    <div
                        className={cn(
                            "rounded-full border-2 flex items-center justify-center shrink-0 transition-colors size-6",
                            rating === r.value ? "border-primary" : "border-border"
                        )}
                    >
                        {rating === r.value && (
                            <div className="rounded-full bg-primary animate-in zoom-in duration-200 size-3" />
                        )}
                    </div>
                    <span
                        className={cn(
                            "font-medium text-lg",
                            rating === r.value ? "text-primary" : "text-foreground"
                        )}
                    >
                        {r.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
