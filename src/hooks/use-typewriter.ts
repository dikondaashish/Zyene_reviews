"use client";

import { useEffect, useRef, useState } from "react";

/** Natural typing pace; speeds up when the reveal falls far behind the incoming stream. */
const BASE_MS_PER_CHAR = 20;
const FASTEST_MS_PER_CHAR = 5;
/** Characters of backlog at which the reveal starts catching up. */
const CATCH_UP_BACKLOG = 120;

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

/**
 * Reveals `text` character by character while `active`. The text may keep growing
 * (a streaming reply); `onDone` fires once `complete` is true and everything is shown.
 * Timer-based rather than requestAnimationFrame so a background tab catches up
 * instead of freezing a half-typed reply.
 */
export function useTypewriter(
    text: string,
    active: boolean,
    complete: boolean,
    onDone?: () => void,
): { visible: string; typing: boolean } {
    const [shown, setShown] = useState(active ? 0 : text.length);
    const latest = useRef({ text, complete, onDone });
    const shownRef = useRef(shown);

    useEffect(() => {
        latest.current = { text, complete, onDone };
    }, [text, complete, onDone]);

    useEffect(() => {
        if (!active) return;
        const instant = prefersReducedMotion();
        let last = performance.now();
        let carry = 0;
        let timer = 0;
        const tick = () => {
            const now = performance.now();
            const { text: target, complete: done } = latest.current;
            const backlog = target.length - shownRef.current;
            const msPerChar = backlog > CATCH_UP_BACKLOG ? FASTEST_MS_PER_CHAR : BASE_MS_PER_CHAR;
            carry += now - last;
            last = now;
            const step = instant ? backlog : Math.min(backlog, Math.floor(carry / msPerChar));
            if (step > 0) {
                carry -= step * msPerChar;
                shownRef.current += step;
                setShown(shownRef.current);
            } else if (backlog <= 0) {
                carry = 0; // Waiting on the network; don't bank time for a later burst.
            }
            if (done && shownRef.current >= target.length) {
                latest.current.onDone?.();
                return;
            }
            timer = window.setTimeout(tick, 16);
        };
        timer = window.setTimeout(tick, 0);
        return () => window.clearTimeout(timer);
    }, [active]);

    const typing = active && (shown < text.length || !complete);
    return { visible: typing ? trimIncompleteMarkdown(text.slice(0, shown)) : text, typing };
}
