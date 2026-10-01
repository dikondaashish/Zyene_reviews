"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WidgetConfig } from "@/lib/widgets/config";

export function useWidgetCarousel(config: WidgetConfig, itemCount: number) {
    const track = useRef<HTMLDivElement>(null);
    const animation = useRef(0);
    const [page, setPage] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [paused, setPaused] = useState(false);
    const [sliderHeight, setSliderHeight] = useState<number>();
    const metrics = useCallback(() => {
        const node = track.current;
        const first = node?.children[0] as HTMLElement | undefined;
        if (!node || !first) return null;
        const step = first.getBoundingClientRect().width + config.gap;
        return { node, step, max: Math.max(0, node.scrollWidth - node.clientWidth), columns: Math.max(1, Math.round((node.clientWidth + config.gap) / step)) };
    }, [config.gap]);
    const scrollTo = useCallback((index: number) => {
        const m = metrics();
        if (!m) return;
        cancelAnimationFrame(animation.current);
        const from = m.node.scrollLeft;
        const to = (config.rtl ? -1 : 1) * Math.min(m.max, Math.max(0, index) * m.step);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) { m.node.scrollLeft = to; return; }
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / config.animationDuration);
            m.node.scrollLeft = from + (to - from) * (1 - (1 - t) ** 3);
            if (t < 1) animation.current = requestAnimationFrame(tick);
        };
        animation.current = requestAnimationFrame(tick);
    }, [metrics, config.rtl, config.animationDuration]);
    const measure = useCallback(() => {
        const m = metrics();
        if (!m) return;
        const last = Math.max(0, Math.ceil((m.max - 2) / m.step));
        if (config.layout === "slider") {
            const card = m.node.children[Math.round(Math.abs(m.node.scrollLeft) / m.step)] as HTMLElement | undefined;
            if (card) setSliderHeight(Math.ceil(card.getBoundingClientRect().height));
        }
        setLastPage(last);
        setPage(Math.abs(m.node.scrollLeft) >= m.max - 2 ? last : Math.min(last, Math.round(Math.abs(m.node.scrollLeft) / m.step)));
    }, [metrics, config.layout]);
    useEffect(() => {
        const node = track.current;
        if (!node) return;
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        if (config.layout === "slider") Array.from(node.children).forEach(child => observer.observe(child));
        else if (node.children[0]) observer.observe(node.children[0]);
        measure();
        return () => { observer.disconnect(); cancelAnimationFrame(animation.current); };
    }, [measure, itemCount, config.rows, config.mobileRows, config.layout]);
    useEffect(() => {
        if (!config.autoplay || paused || !lastPage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = window.setInterval(() => {
            if (document.hidden || track.current?.matches(":hover, :focus-within")) return;
            const increment = config.scrollMode === "page" ? metrics()?.columns || 1 : 1;
            scrollTo(page >= lastPage ? 0 : Math.min(lastPage, page + increment));
        }, config.autoplayDelay * 1000);
        return () => clearInterval(timer);
    }, [config.autoplay, config.autoplayDelay, config.scrollMode, paused, page, lastPage, scrollTo, metrics]);
    const advance = (direction: number) => scrollTo(page + direction * (config.scrollMode === "page" ? metrics()?.columns || 1 : 1));
    return { track, page, lastPage, measure, advance, scrollTo, paused, setPaused, sliderHeight };
}
