import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/components/reviews/review-card-types";
import { ReviewCardGoogleIcon } from "@/components/reviews/review-card-google-icon";
import { ReviewCardStatusBadge, ReviewCardStars } from "@/components/reviews/review-card-badges";
import { getReviewAuthorInitial, getReviewAvatarUrl } from "@/components/reviews/review-card-derived";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ReviewCardHeader({
    review,
    isSelected,
    onSelect,
}: {
    review: Review;
    isSelected: boolean;
    onSelect?: (id: string, selected: boolean) => void;
}) {
    const avatarUrl = getReviewAvatarUrl(review);
    const authorInitial = getReviewAuthorInitial(review);

    return (
        <>
            {onSelect && (
                <div
                    className={cn(
                        "absolute left-4 top-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity",
                        isSelected && "opacity-100"
                    )}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(review.id, e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                </div>
            )}

            <div
                className={cn(
                    "relative z-10 mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
                    onSelect && "sm:pl-7"
                )}
            >
                <div className={cn("flex min-w-0 gap-3", onSelect && "pl-7 sm:pl-0")}>
                    <Avatar size="lg" className="h-10 w-10 shrink-0 border border-border">
                        {avatarUrl ? (
                            <AvatarImage
                                src={avatarUrl}
                                alt={review.author_name || "Reviewer"}
                                referrerPolicy="no-referrer"
                            />
                        ) : null}
                        <AvatarFallback className="bg-muted text-muted-foreground font-bold text-sm">
                            {authorInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <div className="break-words text-sm font-semibold text-foreground">
                            {review.author_name || "Anonymous"}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <ReviewCardStars rating={review.rating} />
                            {(review.review_date || review.published_at || review.created_at) && (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(
                                        review.review_date || review.published_at || review.created_at || ""
                                    ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                            )}
                            {review.platform === "google" ? (
                                <span
                                    className="inline-flex h-5 w-5 items-center justify-center rounded border border-primary/20 bg-primary/10"
                                    aria-label="Google"
                                    title="Google"
                                >
                                    <ReviewCardGoogleIcon className="h-3.5 w-3.5" />
                                </span>
                            ) : (
                                <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase font-semibold tracking-wide border border-primary/20">
                                    {review.platform || "Google"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:max-w-[45%] sm:justify-end sm:gap-2">
                    {review.urgency_score && review.urgency_score >= 7 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full animate-pulse">
                            <Zap className="w-3 h-3 fill-destructive" />
                            URGENT
                        </span>
                    )}
                    {review.sentiment && (
                        <span
                            className={cn(
                                "text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize",
                                review.sentiment === "positive" && "bg-chart-2/10 text-chart-2 border-chart-2/20",
                                review.sentiment === "negative" &&
                                    "bg-destructive/10 text-destructive border-destructive/20",
                                review.sentiment === "neutral" && "bg-muted text-muted-foreground border-border",
                                review.sentiment === "mixed" && "bg-primary/10 text-primary border-primary/20"
                            )}
                        >
                            {review.sentiment}
                        </span>
                    )}
                    {review.id.startsWith("demo-") && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Demo Data
                        </span>
                    )}
                    <ReviewCardStatusBadge status={review.response_status} />
                </div>
            </div>
        </>
    );
}
