import { ArrowRight, Heart, Reply, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
    SpotlightLabels,
    SpotlightReview,
    ThemeColor,
} from "@/components/ui/animated-review-card/animated-review-card-types";

type ClassNames = NonNullable<
    import("@/components/ui/animated-review-card/animated-review-card-types").AnimatedReviewCardsProps["classNames"]
>;

interface SpotlightCardFootersProps {
    review: SpotlightReview;
    theme: ThemeColor;
    classNames?: ClassNames;
    labels?: SpotlightLabels;
    starColors: { active: string; inactive: string };
}

export function SpotlightCardFooters({ review, theme, classNames, labels, starColors }: SpotlightCardFootersProps) {
    if (!labels) return null;

    if (theme === "default") {
        return (
            <div className="mt-auto flex shrink-0 flex-col gap-2 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/reviews"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
                    >
                        <Reply className="h-3.5 w-3.5" aria-hidden />
                        Reply
                    </Link>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => toast.message("Open Reviews to thank customers or follow up.")}
                    >
                        <Heart className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                        Thank
                    </Button>
                </div>
                <Link
                    href="/reviews"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    Open
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-auto flex shrink-0 flex-col gap-2 border-t border-border/40 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className={cn("flex items-center gap-0.5", classNames?.rating)}>
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
                </div>
                <Link href="/reviews" className="text-xs font-semibold text-primary hover:underline">
                    {labels.viewInReviews}
                </Link>
            </div>
        </div>
    );
}
