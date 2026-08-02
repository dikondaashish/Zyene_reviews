"use client";

import { useId, useRef } from "react";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { playThemeToggleClick } from "@/lib/theme/theme-toggle-audio";

export interface AnimatedThemeTogglerProps {
    /** Play a short click when toggling (requires user gesture for Web Audio). */
    sound?: boolean;
    isDark: boolean;
    onToggle: () => void;
}

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

export function AnimatedThemeToggler({
    sound = true,
    isDark,
    onToggle,
}: AnimatedThemeTogglerProps) {
    const rawId = useId();
    const maskId = `att${rawId.replace(/:/g, "")}`;
    const lastSoundAt = useRef(0);

    const handleClick = () => {
        onToggle();
        if (sound) playThemeToggleClick(lastSoundAt);
    };

    return (
        <LazyMotion features={domAnimation}>
            <style>{`
        .att-btn{--at-ink:rgba(0,0,0,0.82)}
        .dark .att-btn,[data-theme="dark"] .att-btn{--at-ink:rgba(255,255,255,0.82)}
      `}</style>
            <m.button
                type="button"
                className="att-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={handleClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.86 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--at-ink)",
                    borderRadius: 8,
                    WebkitTapHighlightColor: "transparent",
                }}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
                <m.svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={false}
                    animate={{ rotate: isDark ? 270 : 0 }}
                    transition={SPRING}
                    style={{ overflow: "visible" }}
                >
                    <mask id={maskId}>
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <m.circle
                            initial={false}
                            animate={{ cx: isDark ? 17 : 33, cy: isDark ? 8 : 0 }}
                            transition={SPRING}
                            r="9"
                            fill="black"
                        />
                    </mask>
                    <m.circle
                        cx="12"
                        cy="12"
                        fill="currentColor"
                        stroke="none"
                        mask={`url(#${maskId})`}
                        initial={false}
                        animate={{ r: isDark ? 9 : 5 }}
                        transition={SPRING}
                    />
                    <m.g
                        initial={false}
                        animate={{
                            opacity: isDark ? 0 : 1,
                            scale: isDark ? 0 : 1,
                            rotate: isDark ? -30 : 0,
                        }}
                        transition={SPRING}
                        style={{ transformOrigin: "12px 12px" }}
                    >
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="5.64" y1="5.64" x2="4.22" y2="4.22" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        <line x1="5.64" y1="18.36" x2="4.22" y2="19.78" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    </m.g>
                </m.svg>
            </m.button>
        </LazyMotion>
    );
}
