"use client";

import { useCallback } from "react";
import type { KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { AnimatedReviewCardsProps } from "@/components/ui/animated-review-card/animated-review-card-types";
import { starColorVariants } from "@/components/ui/animated-review-card/animated-review-card-variants";
import { useAnimatedReviewCardsRotation } from "@/components/ui/animated-review-card/use-animated-review-cards-rotation";
import { AnimatedReviewCardCarousel } from "@/components/ui/animated-review-card/animated-review-card-carousel";
import { AnimatedReviewCardShell } from "@/components/ui/animated-review-card/animated-review-card-shell";
import {
    SpotlightDeckBottomHint,
    SpotlightDeckPagination,
    SpotlightShellTopNav,
} from "@/components/ui/animated-review-card/animated-review-card-deck-extras";

export const AnimatedReviewCards = ({
    reviews: initialReviewsProp = [],
    interactionType = "drag",
    animationDuration = 0.3,
    scaleStep = 0.05,
    verticalSpacing = 10,
    horizontalSpacing: _horizontalSpacing = 20,
    autoRotate = true,
    rotateInterval = 8000,
    theme = "default",
    classNames,
    labels,
    shellTitle,
    shellSubtitle,
    manageAllHref,
    manageAllLabel,
}: AnimatedReviewCardsProps) => {
    void _horizontalSpacing;
    const reduceMotion = useReducedMotion();
    const effectiveDuration = reduceMotion ? 0 : animationDuration;

    const starColors = starColorVariants[theme];
    const {
        reviews,
        setIsInteracting,
        setHoverPause,
        setFocusWithin,
        stableOrder,
        rotateForward,
        rotateBackward,
        handleInteraction,
        activeDotIndex,
        orderLen,
        counterCurrent,
    } = useAnimatedReviewCardsRotation(initialReviewsProp, autoRotate, rotateInterval, reduceMotion);

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                rotateForward();
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                rotateBackward();
            }
        },
        [rotateForward, rotateBackward]
    );

    const showShell = Boolean(shellTitle);
    const navDisabled = reviews.length < 2;

    const pagination =
        labels && stableOrder.length > 0 ? (
            <SpotlightDeckPagination
                labels={labels}
                stableOrder={stableOrder}
                activeDotIndex={activeDotIndex}
            />
        ) : null;

    const bottomHint = labels ? (
        <SpotlightDeckBottomHint labels={labels} showShell={showShell} />
    ) : null;

    const topNav =
        labels && showShell ? (
            <SpotlightShellTopNav
                labels={labels}
                showShell={showShell}
                navDisabled={navDisabled}
                counterCurrent={counterCurrent}
                orderLen={orderLen}
                rotateBackward={rotateBackward}
                rotateForward={rotateForward}
            />
        ) : null;

    const body = (
        <>
            <AnimatedReviewCardCarousel
                reviews={reviews}
                interactionType={interactionType}
                reduceMotion={reduceMotion}
                effectiveDuration={effectiveDuration}
                theme={theme}
                classNames={classNames}
                labels={labels}
                starColors={starColors}
                verticalSpacing={verticalSpacing}
                scaleStep={scaleStep}
                showShell={showShell}
                setHoverPause={setHoverPause}
                setFocusWithin={setFocusWithin}
                onKeyDown={onKeyDown}
                shellTitle={shellTitle}
                setIsInteracting={setIsInteracting}
                handleInteraction={handleInteraction}
            />
            {pagination}
            {bottomHint}
        </>
    );

    return (
        <div className={cn("not-prose relative w-full h-full", classNames?.container)}>
            {showShell && shellTitle ? (
                <AnimatedReviewCardShell
                    shellTitle={shellTitle}
                    shellSubtitle={shellSubtitle}
                    manageAllHref={manageAllHref}
                    manageAllLabel={manageAllLabel}
                    topNav={topNav}
                >
                    {body}
                </AnimatedReviewCardShell>
            ) : (
                <div className="flex flex-col h-full w-full items-center">{body}</div>
            )}
        </div>
    );
};
