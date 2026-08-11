"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

import { spring } from "@/lib/motion/springs";

/**
 * App-wide motion defaults.
 *
 * `reducedMotion="user"` makes every Framer Motion animation in the tree honour
 * `prefers-reduced-motion` without each component opting in: transform and
 * layout animations are disabled while opacity and colour still animate, which
 * is the gentler non-vestibular equivalent rather than no feedback at all.
 *
 * The default transition is a critically damped spring, so motion that does not
 * specify its own transition settles naturally and stays interruptible instead
 * of running a fixed-duration tween to completion.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <MotionConfig reducedMotion="user" transition={spring.default}>
            {children}
        </MotionConfig>
    );
}
