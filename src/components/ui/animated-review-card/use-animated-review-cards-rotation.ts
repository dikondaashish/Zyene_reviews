import { useCallback, useEffect, useState } from "react";
import type { SpotlightReview } from "@/components/ui/animated-review-card/animated-review-card-types";
import { MAX_STACK } from "@/components/ui/animated-review-card/animated-review-card-types";

export function useAnimatedReviewCardsRotation(
    initialReviewsProp: SpotlightReview[],
    autoRotate: boolean,
    rotateInterval: number,
    reduceMotion: boolean | null
) {
    const effectiveAutoRotate = autoRotate && !reduceMotion;

    const [reviews, setReviews] = useState<SpotlightReview[]>(() => initialReviewsProp.slice(0, MAX_STACK));
    const [isInteracting, setIsInteracting] = useState(false);
    const [hoverPause, setHoverPause] = useState(false);
    const [focusWithin, setFocusWithin] = useState(false);

    const [stableOrder, setStableOrder] = useState<string[]>([]);

    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect -- mirrors original prop→deck sync */
        const next = initialReviewsProp.slice(0, MAX_STACK);
        setReviews(next);
        const ids = next.map((r) => String(r.id));
        if (ids.join("|") !== stableOrder.join("|")) {
            setStableOrder(ids);
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [initialReviewsProp, stableOrder]);

    const pauseRotation = hoverPause || focusWithin || isInteracting;

    const rotateForward = useCallback(() => {
        setReviews((prev) => {
            if (prev.length < 2) return prev;
            const next = [...prev];
            const [first] = next.splice(0, 1);
            next.push(first);
            return next;
        });
    }, []);

    const rotateBackward = useCallback(() => {
        setReviews((prev) => {
            if (prev.length < 2) return prev;
            const next = [...prev];
            const last = next.pop()!;
            next.unshift(last);
            return next;
        });
    }, []);

    const handleInteraction = (index: number) => {
        setReviews((prevReviews) => {
            if (index < 0 || index >= prevReviews.length) return prevReviews;
            const newReviews = [...prevReviews];
            const [removed] = newReviews.splice(index, 1);
            newReviews.push(removed);
            return newReviews;
        });
    };

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;
        if (effectiveAutoRotate && !pauseRotation && reviews.length > 1) {
            intervalId = setInterval(() => {
                rotateForward();
            }, rotateInterval);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [effectiveAutoRotate, rotateInterval, pauseRotation, reviews.length, rotateForward]);

    const rawActiveIndex =
        reviews[0] && stableOrder.length > 0
            ? stableOrder.findIndex((id) => id === String(reviews[0].id))
            : 0;
    const activeDotIndex = rawActiveIndex < 0 ? 0 : rawActiveIndex;
    const orderLen = stableOrder.length || reviews.length || 1;
    const counterCurrent = reviews.length ? Math.min(activeDotIndex + 1, orderLen) : 0;

    return {
        reviews,
        setReviews,
        isInteracting,
        setIsInteracting,
        hoverPause,
        setHoverPause,
        focusWithin,
        setFocusWithin,
        stableOrder,
        pauseRotation,
        rotateForward,
        rotateBackward,
        handleInteraction,
        activeDotIndex,
        orderLen,
        counterCurrent,
    };
}
