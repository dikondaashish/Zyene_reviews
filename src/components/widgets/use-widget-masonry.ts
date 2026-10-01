"use client";

import { useEffect, useRef } from "react";
import type { WidgetConfig } from "@/lib/widgets/config";

export function useWidgetMasonry(config: WidgetConfig, count: number) {
    const root = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const node = root.current;
        if (!node || config.layout !== "masonry") return;
        const cards = Array.from(node.children) as HTMLElement[];
        let frame = 0;
        const layout = () => {
            const columns = node.clientWidth <= 480 ? 1 : node.clientWidth <= 760 ? Math.min(config.columns || 2, 2) : config.columns || 3;
            const width = (node.clientWidth - (columns - 1) * config.gap) / columns;
            const heights = Array<number>(columns).fill(0);
            cards.forEach(card => { card.style.cssText = `width:${width}px;position:absolute;`; });
            const sizes = cards.map(card => card.getBoundingClientRect().height);
            cards.forEach((card, index) => {
                const column = heights.indexOf(Math.min(...heights));
                card.style.cssText = `width:${width}px;position:absolute;inset-inline-start:${column * (width + config.gap)}px;top:${heights[column]}px;`;
                heights[column] += sizes[index] + config.gap;
            });
            node.dataset.masonryReady = "true";
            node.style.height = `${Math.max(0, Math.max(...heights) - config.gap)}px`;
        };
        const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(layout); };
        const observer = new ResizeObserver(schedule); observer.observe(node); cards.forEach(card => observer.observe(card));
        schedule();
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    }, [config.layout, config.columns, config.gap, count]);
    return root;
}
