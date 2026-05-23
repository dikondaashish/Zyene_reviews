import { MoreHorizontal, Star } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
    SpotlightLabels,
    SpotlightReview,
    ThemeColor,
} from "@/components/ui/animated-review-card/animated-review-card-types";
import { nameVariants } from "@/components/ui/animated-review-card/animated-review-card-variants";
import {
    PlatformBadge,
    SentimentPill,
    SpotlightRatingStars,
    spotlightInitials,
} from "@/components/ui/animated-review-card/animated-review-card-platform";

type ClassNames = NonNullable<
    import("@/components/ui/animated-review-card/animated-review-card-types").AnimatedReviewCardsProps["classNames"]
>;

interface SpotlightActiveFaceProps {
    review: SpotlightReview;
    theme: ThemeColor;
    classNames?: ClassNames;
    labels?: SpotlightLabels;
    starColors: { active: string; inactive: string };
}

export function SpotlightActiveFace({ review, theme, classNames, labels, starColors }: SpotlightActiveFaceProps) {
    return (
        <div className={cn("mb-3 flex min-h-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between", classNames?.header)}>
            <div className="flex min-w-0 flex-1 gap-2.5 sm:gap-3">
                <Avatar className={cn("h-10 w-10 shrink-0 ring-1 ring-border", classNames?.avatar)}>
                    {review?.avatar ? (
                        <AvatarImage src={review.avatar} alt={review.name} referrerPolicy="no-referrer" />
                    ) : null}
                    <AvatarFallback
                        className={cn(
                            "text-xs font-semibold",
                            theme === "default" ? "bg-chart-4/25 text-chart-4" : "bg-muted text-muted-foreground"
                        )}
                    >
                        {spotlightInitials(review?.name || "")}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2
                            className={nameVariants({
                                theme,
                                className: cn("max-w-full break-words text-[15px] leading-snug", classNames?.name),
                            })}
                        >
                            {review?.name}
                        </h2>
                        {review.platform ? <PlatformBadge platform={review.platform} theme={theme} /> : null}
                        {review.sentiment && theme !== "default" ? (
                            <SentimentPill sentiment={review.sentiment} theme={theme} />
                        ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {theme === "default" ? (
                            <SpotlightRatingStars rating={review.rating ?? 0} />
                        ) : (
                            <span className={cn("flex items-center gap-0.5", classNames?.rating)}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-4 w-4 md:h-5 md:w-5",
                                            i < (review?.rating ?? 0)
                                                ? classNames?.activeStarColor || starColors.active
                                                : classNames?.inactiveStarColor || starColors.inactive,
                                            classNames?.star
                                        )}
                                    />
                                ))}
                            </span>
                        )}
                        {review.reviewedAt ? (
                            <time className="text-xs text-muted-foreground" dateTime={review.reviewedAt}>
                                {formatDistanceToNow(new Date(review.reviewedAt), {
                                    addSuffix: true,
                                })}
                            </time>
                        ) : null}
                    </div>
                </div>
            </div>
            {labels ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground"
                            aria-label="Review actions"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/reviews">{labels.viewInReviews}</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null}
        </div>
    );
}
