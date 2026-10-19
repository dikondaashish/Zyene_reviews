"use client";

import { useEffect, useRef, useState } from "react";

/** Short replies type at a natural pace; long ones speed up so none takes much over 3.5s. */
const MAX_DURATION_MS = 3_500;
const SLOWEST_MS_PER_CHAR = 22;
const FASTEST_MS_PER_CHAR = 6;

function prefersReducedMotion(): boolean {
    try {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
        return false;
    }
}

/**
 * Drops a trailing half-written `**bold**` or `[link](...)` so formatting appears only
 * once complete, instead of flashing raw markdown while the reply types out.
 */
export function trimIncompleteMarkdown(partial: string): string {
    let text = partial;
    if ((text.match(/\*\*/g)?.length ?? 0) % 2 === 1) text = text.slice(0, text.lastIndexOf("**"));
    const open = text.lastIndexOf("[");
    if (open !== -1 && !/\[[^\]]*\]\([^)]*\)/.test(text.slice(open))) text = text.slice(0, open);
    return text;
}

/** Reveals `text` character by character while `active`; calls `onDone` once at the end. */
export function useTypewriter(text: string, active: boolean, onDone?: () => void): { visible: string; typing: boolean } {
    const [shown, setShown] = useState(active ? 0 : text.length);
    const doneRef = useRef(onDone);

    useEffect(() => {
        doneRef.current = onDone;
    }, [onDone]);

    useEffect(() => {
        if (!active) return;
        // Reduced motion: the first frame shows the whole reply.
        const msPerChar = prefersReducedMotion()
            ? 0
            : Math.min(SLOWEST_MS_PER_CHAR, Math.max(FASTEST_MS_PER_CHAR, MAX_DURATION_MS / Math.max(text.length, 1)));
        // Timers rather than requestAnimationFrame: rAF stops in background tabs, which would
        // freeze a half-typed reply. Progress is time-based, so a throttled tab just catches up.
        const start = performance.now();
        let timer = 0;
        const tick = () => {
            const elapsed = performance.now() - start;
            const next = msPerChar === 0 ? text.length : Math.min(text.length, Math.floor(elapsed / msPerChar) + 1);
            setShown(next);
            if (next < text.length) timer = window.setTimeout(tick, 16);
            else doneRef.current?.();
        };
        timer = window.setTimeout(tick, 0);
        return () => window.clearTimeout(timer);
    }, [active, text]);

    const typing = active && shown < text.length;
    return { visible: typing ? trimIncompleteMarkdown(text.slice(0, shown)) : text, typing };
}
