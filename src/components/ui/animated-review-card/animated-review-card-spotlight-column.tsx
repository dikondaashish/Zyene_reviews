import { cn } from "@/lib/utils";
import { textVariants } from "@/components/ui/animated-review-card/animated-review-card-variants";
import type {
    SpotlightLabels,
    SpotlightReview,
    ThemeColor,
} from "@/components/ui/animated-review-card/animated-review-card-types";
import { SpotlightActiveFace } from "@/components/ui/animated-review-card/animated-review-card-spotlight-active";
import { SpotlightBackFace } from "@/components/ui/animated-review-card/animated-review-card-spotlight-back";
import { SpotlightCardFooters } from "@/components/ui/animated-review-card/animated-review-card-spotlight-footers";

type ClassNames = NonNullable<
    import("@/components/ui/animated-review-card/animated-review-card-types").AnimatedReviewCardsProps["classNames"]
>;

interface SpotlightCardColumnProps {
    review: SpotlightReview;
    index: number;
    theme: ThemeColor;
    classNames?: ClassNames;
    labels?: SpotlightLabels;
    starColors: { active: string; inactive: string };
}

export function SpotlightCardColumn({
    review,
    index,
    theme,
    classNames,
    labels,
    starColors,
}: SpotlightCardColumnProps) {
    return (
        <div className={cn("flex h-full min-h-0 flex-col p-5 md:p-6", classNames?.cardContent)}>
            {index === 0 ? (
                <SpotlightActiveFace
                    review={review}
                    theme={theme}
                    classNames={classNames}
                    labels={labels}
                    starColors={starColors}
                />
            ) : (
                <SpotlightBackFace review={review} theme={theme} classNames={classNames} />
            )}

            <p
                className={cn(
                    "min-h-0 flex-1 overflow-hidden text-sm leading-relaxed break-words",
                    index === 0 ? "line-clamp-4 sm:line-clamp-5" : "line-clamp-2 sm:line-clamp-3",
                    textVariants({ theme, className: classNames?.text })
                )}
            >
                {review?.text}
            </p>

            {index === 0 ? (
                <SpotlightCardFooters
                    review={review}
                    theme={theme}
                    classNames={classNames}
                    labels={labels}
                    starColors={starColors}
                />
            ) : null}
        </div>
    );
}
