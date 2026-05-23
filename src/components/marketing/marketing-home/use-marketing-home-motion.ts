"use client";

import { useMemo } from "react";
import { useReducedMotion, type Variants } from "framer-motion";

export function useMarketingHomeMotion() {
    const prefersReducedMotion = useReducedMotion();

    const fadeInUp: Variants = useMemo(
        () =>
            prefersReducedMotion
                ? {
                      hidden: { opacity: 1, y: 0 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0 } },
                  }
                : {
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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
