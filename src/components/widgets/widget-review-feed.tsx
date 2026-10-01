"use client";

import { useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { PublicWidgetData, PublicWidgetReview } from "@/lib/widgets/public-types";
import type { WidgetConfig } from "@/lib/widgets/config";
import { WidgetReviewCard } from "@/components/widgets/widget-review-card";
import { WidgetSummaryCard } from "@/components/widgets/widget-summary-card";
import { useWidgetCarousel } from "@/components/widgets/use-widget-carousel";
import { useWidgetMasonry } from "@/components/widgets/use-widget-masonry";

export function WidgetReviewFeed({ reviews, config, summary, rating = 0, onOpen, onPhoto }: {
    reviews: PublicWidgetReview[]; config: WidgetConfig; summary?: PublicWidgetData["summary"]; rating?: number;
    onOpen?: (id: string) => void; onPhoto?: (review: PublicWidgetReview, index: number) => void;
}) {
    const [visible, setVisible] = useState(6);
    const horizontal = config.layout === "carousel" || config.layout === "slider";
    const summaryVisible = config.showSummary && !!summary?.points.length;
    const carousel = useWidgetCarousel(config, reviews.length + (summaryVisible ? 1 : 0));
    const masonry = useWidgetMasonry(config, Math.min(visible, reviews.length) + (summaryVisible ? 1 : 0));
    if (!reviews.length) return <p className="rw-empty">No reviews match these filters yet.</p>;
    const dotStart = Math.max(0, Math.min(carousel.page - 3, carousel.lastPage - 6));
    const dots = Array.from({ length: Math.min(7, carousel.lastPage + 1) }, (_, i) => dotStart + i);
    return <div className="rw-feed-container">
        <div className={`rw-feed rw-${config.layout} ${!config.swipe ? "rw-no-swipe" : ""}`} ref={horizontal ? carousel.track : config.layout === "masonry" ? masonry : undefined}
            style={{ "--rw-rows": config.layout === "slider" ? 1 : config.rows, "--rw-mobile-rows": config.layout === "slider" ? 1 : config.mobileRows, height: config.layout === "slider" ? carousel.sliderHeight : undefined } as CSSProperties}
            role="region" aria-label="Customer reviews" tabIndex={horizontal ? 0 : undefined}
            onScroll={horizontal ? carousel.measure : undefined} onKeyDown={event => {
                if (!horizontal || event.target !== event.currentTarget || !["ArrowRight", "ArrowLeft"].includes(event.key)) return;
                event.preventDefault(); carousel.advance((event.key === "ArrowRight" ? 1 : -1) * (config.rtl ? -1 : 1));
            }}>
            {summaryVisible && <WidgetSummaryCard summary={summary!} rating={rating} bubble={config.reviewStyle === "bubble"} />}
            {(horizontal ? reviews : reviews.slice(0, visible)).map(review => <WidgetReviewCard key={review.id} review={review} config={config} onOpen={onOpen} onPhoto={onPhoto} />)}
        </div>
        {horizontal && <>
            {config.showArrows && carousel.lastPage > 0 && <>
                {carousel.page > 0 && <button className="rw-arrow rw-arrow-prev" aria-label="Previous reviews" onClick={() => carousel.advance(-1)}><ChevronLeft size={22} /></button>}
                {carousel.page < carousel.lastPage && <button className="rw-arrow rw-arrow-next" aria-label="Next reviews" onClick={() => carousel.advance(1)}><ChevronRight size={22} /></button>}
            </>}
            <div className="rw-navigation">
                {config.showPagination && carousel.lastPage > 0 && <div className="rw-dots" aria-label="Choose reviews">{dots.map(index => <button key={index} aria-label={`Show reviews ${index + 1}`} aria-current={index === carousel.page ? "true" : undefined} onClick={() => carousel.scrollTo(index)}><span /></button>)}</div>}
                {config.autoplay && carousel.lastPage > 0 && <button className="rw-pause" aria-label={carousel.paused ? "Play slideshow" : "Pause slideshow"} onClick={() => carousel.setPaused(!carousel.paused)}>{carousel.paused ? <Play size={14} /> : <Pause size={14} />}</button>}
            </div>
        </>}
        {!horizontal && visible < reviews.length && <button className="rw-load" onClick={() => setVisible(v => v + 6)}>Load More</button>}
    </div>;
}
