"use client";

import { motion } from "framer-motion";
import type { DashboardTourTargetRect } from "@/components/tours/dashboard-tour-types";

export function DashboardTourSpotlightSvg({
    targetRect,
    spotlightX,
    spotlightY,
    spotlightW,
    spotlightH,
}: {
    targetRect: DashboardTourTargetRect | null;
    spotlightX: number;
    spotlightY: number;
    spotlightW: number;
    spotlightH: number;
}) {
    return (
        <svg
            className="tour-spotlight-svg"
            style={{ pointerEvents: "all" }}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <defs>
                <mask id="tour-spotlight-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    {targetRect && (
                        <rect
                            x={spotlightX}
                            y={spotlightY}
                            width={spotlightW}
                            height={spotlightH}
                            rx="12"
                            ry="12"
                            fill="black"
                        />
                    )}
                </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="var(--tour-overlay-scrim)" mask="url(#tour-spotlight-mask)" />
        </svg>
    );
}

export function DashboardTourSpotlightRing({
    targetRect,
    spotlightX,
    spotlightY,
    spotlightW,
    spotlightH,
}: {
    targetRect: DashboardTourTargetRect | null;
    spotlightX: number;
    spotlightY: number;
    spotlightW: number;
    spotlightH: number;
}) {
    if (!targetRect) return null;
    return (
        <motion.div
            className="tour-spotlight-ring"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                top: spotlightY,
                left: spotlightX,
                width: spotlightW,
                height: spotlightH,
            }}
            transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
            }}
        />
    );
}
