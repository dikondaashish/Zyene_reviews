import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SpotlightReview, ThemeColor } from "@/components/ui/animated-review-card/animated-review-card-types";
import { nameVariants } from "@/components/ui/animated-review-card/animated-review-card-variants";

type ClassNames = NonNullable<
    import("@/components/ui/animated-review-card/animated-review-card-types").AnimatedReviewCardsProps["classNames"]
>;

interface SpotlightBackFaceProps {
    review: SpotlightReview;
    theme: ThemeColor;
    classNames?: ClassNames;
}

export function SpotlightBackFace({ review, theme, classNames }: SpotlightBackFaceProps) {
    return (
        <div className={cn("mb-2 flex min-h-0 items-start gap-2", classNames?.header)}>
            <Avatar className={cn("h-8 w-8 shrink-0", classNames?.avatar)}>
                {review?.avatar ? (
                    <AvatarImage src={review.avatar} alt={review.name} referrerPolicy="no-referrer" />
                ) : null}
                <AvatarFallback className="text-[10px] font-medium">{review?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2
                className={nameVariants({
                    theme,
                    className: cn("truncate text-sm", classNames?.name),
                })}
            >
                {review?.name}
            </h2>
        </div>
    );
}
