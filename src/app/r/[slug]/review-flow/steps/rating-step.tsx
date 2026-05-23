import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RATINGS } from "../types";

export interface RatingStepProps {
    businessName: string;
    logoUrl?: string;
    initials: string;
    resolvedBrandColor: string;
    ratingSubtitle?: string;
    welcomeMsg?: string;
    ratingStyle: string;
    rating: number | null;
    hoverRating: number | null;
    onRate: (stars: number) => void;
    onHoverRating: (stars: number | null) => void;
}

export function RatingStep({
    businessName,
    logoUrl,
    initials,
    resolvedBrandColor,
    ratingSubtitle,
    welcomeMsg,
    ratingStyle,
    rating,
    hoverRating,
    onRate,
    onHoverRating,
}: RatingStepProps) {
    return (
        <div className="px-8 py-10 space-y-8">
            <div className="flex flex-col items-center gap-4">
                {logoUrl ? (
                    <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-background dark:bg-[rgb(30,41,59)] dark:border-[rgb(30,41,59)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt={businessName} className="h-full w-full object-cover" />
                    </div>
                ) : (
                    <div
                        className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg text-primary-foreground"
                        style={{ backgroundColor: resolvedBrandColor }}
                    >
                        <span className="text-2xl font-bold">{initials}</span>
                    </div>
                )}
                <div className="text-center">
                    <h1 className="text-xl font-bold text-foreground mb-1">{businessName}</h1>
                    <p className="text-muted-foreground text-sm">{ratingSubtitle || "Your feedback means a lot to us!"}</p>
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground leading-tight px-4 whitespace-pre-line">
                    {welcomeMsg || "How was your experience?"}
                </h2>
            </div>

            {ratingStyle === "emoji" && (
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
            )}

            {ratingStyle === "stars" && (
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
            )}

            {ratingStyle === "number" && (
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
            )}

            {ratingStyle === "slider" && (
                <div className="w-full space-y-6 pt-4 pb-2 max-w-sm mx-auto">
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={rating !== null ? rating : hoverRating !== null ? hoverRating : 5}
                        onChange={(e) => onHoverRating(parseInt(e.target.value))}
                        onMouseUp={(e) => {
                            const val = parseInt((e.target as HTMLInputElement).value);
                            onHoverRating(null);
                            onRate(val);
                        }}
                        onTouchEnd={(e) => {
                            const val = parseInt((e.target as HTMLInputElement).value);
                            onHoverRating(null);
                            onRate(val);
                        }}
                        className="w-full cursor-pointer h-3 bg-muted rounded-lg appearance-none accent-primary hover:accent-primary transition-all touch-none"
                        style={{ touchAction: "none" }}
                    />
                    <div className="flex justify-between text-xs sm:text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                        <span>POOR</span>
                        <span>EXCELLENT</span>
                    </div>
                </div>
            )}

            {ratingStyle === "radio" && (
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
                                    "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                    rating === r.value ? "border-primary" : "border-border"
                                )}
                            >
                                {rating === r.value && (
                                    <div className="h-3 w-3 rounded-full bg-primary animate-in zoom-in duration-200" />
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
            )}
        </div>
    );
}
