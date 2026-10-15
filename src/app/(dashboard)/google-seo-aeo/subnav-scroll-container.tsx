"use client";

import { useEffect, useRef, type ReactNode } from "react";

type SubnavScrollContainerProps = { label: string; className?: string; children: ReactNode };

/**
 * On phones the tab row scrolls sideways, and the current tab could start off
 * screen (Alerts, Competitive insights, Advanced tools). Centre it on load.
 * Sets scrollLeft directly rather than scrollIntoView, so the page never jumps.
 */
export function SubnavScrollContainer({ label, className, children }: SubnavScrollContainerProps) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const nav = ref.current;
        const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
        if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
        // Measured against the nav itself: offsetLeft is relative to the nearest
        // positioned ancestor, which is not this scroll container.
        const offset = active.getBoundingClientRect().left - nav.getBoundingClientRect().left;
        nav.scrollLeft += offset - (nav.clientWidth - active.offsetWidth) / 2;
    }, []);

    return (
        <nav ref={ref} aria-label={label} className={className}>
            {children}
        </nav>
    );
}
