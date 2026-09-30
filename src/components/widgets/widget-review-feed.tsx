"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, Sparkles } from "lucide-react";
import type { PublicWidgetReview } from "@/lib/widgets/public-types";
import type { WidgetConfig } from "@/lib/widgets/config";
import { WidgetReviewCard } from "@/components/widgets/widget-review-card";

export function WidgetReviewFeed({ reviews, config }: { reviews: PublicWidgetReview[]; config: WidgetConfig }) {
    const track = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [paused, setPaused] = useState(false);
    const [visible, setVisible] = useState(6);
    const horizontal = config.layout === "carousel" || config.layout === "slider";
    const scrollTo = useCallback((index: number) => {
        const node = track.current;
        if (!node) return;
        const first = node.children[0] as HTMLElement | undefined;
        if (first) node.scrollTo({ left: (config.rtl ? -1 : 1) * index * (first.getBoundingClientRect().width + config.gap), behavior: "instant" });
    }, [config.gap, config.rtl]);
    useEffect(() => {
        const node = track.current;
        if (!node || !horizontal) return;
        const measure = () => {
            const first = node.children[0] as HTMLElement | undefined;
            const step = (first?.getBoundingClientRect().width || 0) + config.gap;
            if (!step) return;
            const last = Math.max(0, Math.ceil((node.scrollWidth - node.clientWidth - 2) / step));
            setLastPage(last);
            setPage(Math.min(last, Math.round(Math.abs(node.scrollLeft) / step)));
        };
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        if (node.children[0]) observer.observe(node.children[0]);
        measure();
        return () => observer.disconnect();
    }, [horizontal, config.gap, reviews.length]);
    useEffect(() => {
        if (!config.autoplay || !horizontal || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = window.setInterval(() => {
            if (document.hidden) return;
            const node = track.current;
            if (node?.matches(":hover, :focus-within")) return;
            scrollTo((page + 1) % (lastPage + 1));
        }, 5000);
        return () => window.clearInterval(timer);
    }, [config.autoplay, horizontal, paused, page, lastPage, scrollTo]);
    const summaries = config.showSummary ? reviews.filter(r => r.summary).slice(0, 3) : [];
    if (!reviews.length) return <p className="rw-empty">No reviews match these filters yet.</p>;
    return <>
        {!!summaries.length && <section className="rw-summary" aria-label="AI review highlights">
            <h3><Sparkles size={18} /> AI review highlights</h3>
            {summaries.map(r => <p key={r.id}>{r.summary} <span>— {r.author_name}</span></p>)}
            <small>AI summaries of these customer reviews. Read the original reviews below.</small>
        </section>}
        <div className={`rw-feed rw-${config.layout}`} ref={track} role="region" aria-label="Customer reviews" tabIndex={0}
            onScroll={() => {
                const node = track.current;
                if (!node || !horizontal) return;
                const first = node.children[0] as HTMLElement;
                const width = first?.getBoundingClientRect().width + config.gap;
                if (width) setPage(Math.abs(node.scrollLeft) >= node.scrollWidth - node.clientWidth - 2 ? lastPage :
                    Math.max(0, Math.min(lastPage, Math.round(Math.abs(node.scrollLeft) / width))));
            }}>
            {(horizontal ? reviews : reviews.slice(0, visible)).map(review => <WidgetReviewCard key={review.id} review={review} config={config} />)}
        </div>
        {horizontal ? <div className="rw-navigation">
            {config.showArrows && <button aria-label="Previous reviews" disabled={page === 0} onClick={() => scrollTo(page - 1)}><ArrowLeft size={18} /></button>}
            {config.showPagination && <span aria-live="polite">{page + 1} / {lastPage + 1}</span>}
            {config.autoplay && <button aria-label={paused ? "Play slideshow" : "Pause slideshow"} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
            {config.showArrows && <button aria-label="Next reviews" disabled={page >= lastPage} onClick={() => scrollTo(page + 1)}><ArrowRight size={18} /></button>}
        </div> : visible < reviews.length && <button className="rw-load" onClick={() => setVisible(v => v + 6)}>Load more reviews</button>}
    </>;
}
