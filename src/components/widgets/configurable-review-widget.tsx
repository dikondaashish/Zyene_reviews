"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { isBadgeLayout, type WidgetConfig } from "@/lib/widgets/config";
import { widgetPresentation, widgetStyle } from "@/lib/widgets/presentation";
import type { PublicWidgetData } from "@/lib/widgets/public-types";
import { WidgetBadgeLayout } from "@/components/widgets/widget-badge-layout";
import { WidgetReviewFeed } from "@/components/widgets/widget-review-feed";
import { WidgetStars } from "@/components/widgets/widget-stars";
import { GoogleLogoIcon } from "@/components/widgets/review-carousel-google-logo";
import "@/components/widgets/review-widget.css";

export function ConfigurableReviewWidget({ data, config, creditUrl }: { data: PublicWidgetData; config: WidgetConfig; creditUrl: string }) {
    const root = useRef<HTMLDivElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const wasOpen = useRef(false);
    const [open, setOpen] = useState(false);
    const { reviews, count, rating } = widgetPresentation(data, config);
    const badge = isBadgeLayout(config.layout);
    useEffect(() => {
        const node = root.current;
        if (!node) return;
        let frame = 0;
        const send = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => window.parent.postMessage({
                type: "zyene-widget-size", height: Math.ceil(node.getBoundingClientRect().height), expanded: open,
            }, "*"));
        };
        const observer = new ResizeObserver(send);
        observer.observe(node);
        send();
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    }, [open]);
    useEffect(() => {
        if (open) closeButton.current?.focus();
        else if (wasOpen.current) root.current?.querySelector<HTMLButtonElement>(".rw-badge")?.focus({ preventScroll: true });
        wasOpen.current = open;
    }, [open]);
    const close = () => {
        setOpen(false);
    };
    return <div ref={root} className={`rw-root rw-theme-${config.theme} ${badge ? "rw-badge-root" : ""}`} style={widgetStyle(config)} dir={config.rtl ? "rtl" : "ltr"} onKeyDown={event => { if (badge && open && event.key === "Escape") close(); }}>
        {badge && !open ? <WidgetBadgeLayout config={config} rating={rating} count={count} businessName={data.businessName}
            writeReviewUrl={data.writeReviewUrl} onOpen={() => setOpen(true)} /> : <>
            {badge && <button ref={closeButton} className="rw-close" onClick={close} aria-label="Close reviews"><X size={20} /></button>}
            <section aria-label={`Reviews for ${data.businessName}`}>
                {config.showTitle && <div className="rw-heading"><h2>{config.title || data.businessName}</h2>{config.caption && <p>{config.caption}</p>}</div>}
                {config.showHeader && <header className="rw-header rw-surface">
                    <div><div className="rw-heading-brand">{config.source === "google" && <GoogleLogoIcon />}<strong>{config.source === "google" ? "Google Reviews" : data.businessName}</strong></div>
                        <div className="rw-rating-line">{config.showRating && <><strong>{rating.toFixed(1)}</strong><WidgetStars rating={rating} /></>}
                            {config.showCount && <span className="rw-muted">({count.toLocaleString()})</span>}
                        </div>
                    </div>
                    {config.showButton && data.writeReviewUrl && <a className="rw-cta" href={data.writeReviewUrl} target="_blank" rel="noopener noreferrer">Review us on Google</a>}
                </header>}
                <WidgetReviewFeed reviews={reviews} config={badge ? { ...config, layout: "list" } : config} />
            </section>
        </>}
        {!data.hideBranding && <a className="rw-credit" href={creditUrl} target="_blank" rel="noopener noreferrer">Free review widget by <strong>Zyene</strong></a>}
    </div>;
}
