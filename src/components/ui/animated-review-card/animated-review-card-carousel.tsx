import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type {
    SpotlightLabels,
    SpotlightReview,
    ThemeColor,
} from "@/components/ui/animated-review-card/animated-review-card-types";
import { cardVariants } from "@/components/ui/animated-review-card/animated-review-card-variants";
import { SpotlightCardColumn } from "@/components/ui/animated-review-card/animated-review-card-spotlight-column";

type ClassNames = NonNullable<
    import("@/components/ui/animated-review-card/animated-review-card-types").AnimatedReviewCardsProps["classNames"]
>;

interface AnimatedReviewCardCarouselProps {
    reviews: SpotlightReview[];
    interactionType: "drag" | "click";
    reduceMotion: boolean | null;
    effectiveDuration: number;
    theme: ThemeColor;
    classNames?: ClassNames;
    labels?: SpotlightLabels;
    starColors: { active: string; inactive: string };
    verticalSpacing: number;
    scaleStep: number;
    showShell: boolean;
    setHoverPause: (v: boolean) => void;
    setFocusWithin: (v: boolean) => void;
    onKeyDown: (e: KeyboardEvent) => void;
    shellTitle?: string;
    setIsInteracting: (v: boolean) => void;
    handleInteraction: (index: number) => void;
}

export function AnimatedReviewCardCarousel({
    reviews,
    interactionType,
    reduceMotion,
    effectiveDuration,
    theme,
    classNames,
    labels,
    starColors,
    verticalSpacing,
    scaleStep,
    showShell,
    setHoverPause,
    setFocusWithin,
    onKeyDown,
    shellTitle,
    setIsInteracting,
    handleInteraction,
}: AnimatedReviewCardCarouselProps) {
    const deckYOffset = Math.min(9, Math.max(5, Math.round(verticalSpacing * 0.65)));
    const deckScaleStep = scaleStep > 0 && scaleStep < 0.1 ? scaleStep : 0.028;

    return (
        <div
            className={cn(
                "relative mx-auto w-full max-w-full overflow-hidden rounded-xl px-0 sm:px-2",
                showShell ? "min-h-[280px] pb-2 pt-1 sm:min-h-[300px]" : "min-h-[320px] pb-2 pt-2 sm:min-h-[360px]"
            )}
            onMouseEnter={() => setHoverPause(true)}
            onMouseLeave={() => setHoverPause(false)}
            onFocusCapture={() => setFocusWithin(true)}
            onBlurCapture={() => setFocusWithin(false)}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label={shellTitle || "Review spotlight"}
            aria-live="polite"
        >
            <div className="grid w-full grid-cols-1 grid-rows-1 justify-items-center">
                <AnimatePresence>
                    {reviews.map((review, index) => (
                        <motion.div
                            key={String(review.id)}
                            initial={reduceMotion ? false : { scale: 0.92, y: 24, opacity: 0 }}
                            animate={{
                                scale: Math.max(0.86, 1 - index * deckScaleStep),
                                y: index * deckYOffset,
                                x: 0,
                                opacity: Math.max(0.35, 1 - index * 0.14),
                                zIndex: reviews.length - index,
                            }}
                            exit={reduceMotion ? undefined : { scale: 0.92, y: 24, opacity: 0 }}
                            transition={{ duration: effectiveDuration }}
                            drag={interactionType === "drag" && !reduceMotion && index === 0 ? "y" : false}
                            dragConstraints={
                                interactionType === "drag" && !reduceMotion && index === 0
                                    ? { top: 0, bottom: 0 }
                                    : undefined
                            }
                            onDragStart={() => setIsInteracting(true)}
                            onDragEnd={() => {
                                setIsInteracting(false);
                                if (interactionType === "drag" && index === 0) handleInteraction(index);
                            }}
                            onClick={() => {
                                if (interactionType === "click" && index === 0) {
                                    setIsInteracting(true);
                                    handleInteraction(index);
                                    setTimeout(() => setIsInteracting(false), 300);
                                }
                            }}
                            title={
                                interactionType === "drag"
                                    ? "Drag to see the next review"
                                    : "Click for next review"
                            }
                            className={cn(
                                cardVariants({
                                    theme,
                                    cursor: interactionType,
                                    className: classNames?.card,
                                }),
                                "h-[min(260px,52vh)] min-h-[200px] sm:h-[240px] sm:min-h-[220px] md:h-[252px]",
                                index > 0 && "cursor-default"
                            )}
                        >
                            <SpotlightCardColumn
                                review={review}
                                index={index}
                                theme={theme}
                                classNames={classNames}
                                labels={labels}
                                starColors={starColors}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
