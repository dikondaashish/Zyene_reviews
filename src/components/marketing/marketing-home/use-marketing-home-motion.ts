"use client";

import { useMemo } from "react";
import { useReducedMotion, type Variants } from "framer-motion";

import { spring } from "@/lib/motion/springs";

export function useMarketingHomeMotion() {
    const prefersReducedMotion = useReducedMotion();

    const fadeInUp: Variants = useMemo(
        () =>
            prefersReducedMotion
                ? {
                      // Content starts visible so it is never gated on an animation
                      // running at all. Entry animations are frozen while a tab is
                      // backgrounded, so anything that only becomes visible by
                      // animating can be stranded invisible; for the readers most
                      // likely to be harmed by that, the fade is not worth the risk.
                      hidden: { opacity: 1, y: 0 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0 } },
                  }
                : {
                      // 30px was travelling on a fixed 600ms tween, so it could not be
                      // interrupted and always took the same time regardless of distance.
                      // A critically damped spring settles naturally and is interruptible.
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: spring.default },
                  },
        [prefersReducedMotion]
    );

    const staggerContainer: Variants = useMemo(
        () =>
            prefersReducedMotion
                ? {
                      hidden: { opacity: 1 },
                      visible: { opacity: 1, transition: { staggerChildren: 0 } },
                  }
                : {
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
                  },
        [prefersReducedMotion]
    );

    return { fadeInUp, staggerContainer, prefersReducedMotion };
}
