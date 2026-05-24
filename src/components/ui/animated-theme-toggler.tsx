"use client";

import { useEffect, useId, useRef, type MutableRefObject } from "react";
import { motion } from "framer-motion";

export interface AnimatedThemeTogglerProps {
    /** Play a short click when toggling (requires user gesture for Web Audio). */
    sound?: boolean;
    isDark: boolean;
    onToggle: () => void;
}

let audioContext: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;

function getAudioContext() {
    if (!audioContext) {
        const Ctx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContext = new Ctx();
    }
    if (audioContext.state === "suspended") {
        void audioContext.resume();
    }
    return audioContext;
}

function getClickBuffer(ac: AudioContext): AudioBuffer {
    if (clickBuffer && clickBuffer.sampleRate === ac.sampleRate) return clickBuffer;
    const rate = ac.sampleRate;
    const len = Math.floor(rate * 0.006);
    const buf = ac.createBuffer(1, len, rate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
        const t = i / len;
        const sine = Math.sin(2 * Math.PI * 3400 * t);
        const noise = Math.random() * 2 - 1;
        ch[i] = (sine * 0.6 + noise * 0.4) * (1 - t) ** 3;
    }
    clickBuffer = buf;
    return buf;
}

function playToggleClick(lastPlayed: MutableRefObject<number>) {
    const now = performance.now();
    if (now - lastPlayed.current < 80) return;
    lastPlayed.current = now;
    try {
        const ac = getAudioContext();
        const buf = getClickBuffer(ac);
        const src = ac.createBufferSource();
        const gain = ac.createGain();
        src.buffer = buf;
        gain.gain.value = 0.08;
        src.connect(gain);
        gain.connect(ac.destination);
        src.start();
    } catch {
        /* ignore — autoplay policies or missing API */
    }
}

export function AnimatedThemeToggler({
    sound = true,
    isDark,
    onToggle,
}: AnimatedThemeTogglerProps) {
    const rawId = useId();
    const maskId = `att${rawId.replace(/:/g, "")}`;
    const lastSoundAt = useRef(0);
    const isFirstRender = useRef(true);

    useEffect(() => {
        requestAnimationFrame(() => {
            isFirstRender.current = false;
        });
    }, []);

    const handleClick = () => {
        onToggle();
        if (sound) playToggleClick(lastSoundAt);
    };

    const spring = isFirstRender.current
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 380, damping: 30 };

    return (
        <>
            <style>{`
        .att-btn{--at-ink:rgba(0,0,0,0.82)}
        .dark .att-btn,[data-theme="dark"] .att-btn{--at-ink:rgba(255,255,255,0.82)}
      `}</style>
            <motion.button
                type="button"
                className="att-btn"
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
                    outline: "none",
                    WebkitTapHighlightColor: "transparent",
                }}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
                <motion.svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={false}
                    animate={{ rotate: isDark ? 270 : 0 }}
                    transition={spring}
                    style={{ overflow: "visible" }}
                >
                    <mask id={maskId}>
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <motion.circle
                            initial={false}
                            animate={{ cx: isDark ? 17 : 33, cy: isDark ? 8 : 0 }}
                            transition={spring}
                            r="9"
                            fill="black"
                        />
                    </mask>
                    <motion.circle
                        cx="12"
                        cy="12"
                        fill="currentColor"
                        stroke="none"
                        mask={`url(#${maskId})`}
                        initial={false}
                        animate={{ r: isDark ? 9 : 5 }}
                        transition={spring}
                    />
                    <motion.g
                        initial={false}
                        animate={{
                            opacity: isDark ? 0 : 1,
                            scale: isDark ? 0 : 1,
                            rotate: isDark ? -30 : 0,
                        }}
                        transition={spring}
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
                    </motion.g>
                </motion.svg>
            </motion.button>
        </>
    );
}
