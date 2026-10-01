"use client";

import { useEffect, useRef, useState } from "react";
import { isBadgeLayout, parseWidgetConfig, type WidgetConfig } from "@/lib/widgets/config";
import { trustedWidgetPreviewMessage } from "@/lib/widgets/preview-message";
import { widgetPresentation, widgetStyle } from "@/lib/widgets/presentation";
import type { PublicWidgetData, PublicWidgetReview } from "@/lib/widgets/public-types";
import { WidgetBadgeLayout } from "@/components/widgets/widget-badge-layout";
import { WidgetReviewFeed } from "@/components/widgets/widget-review-feed";
import { WidgetHeader } from "@/components/widgets/widget-header";
import { WidgetReviewsDialog } from "@/components/widgets/widget-reviews-dialog";
import { WidgetPhotoDialog } from "@/components/widgets/widget-photo-dialog";
import "@/components/widgets/review-widget.css";
import "@/components/widgets/widget-badges.css";
import "@/components/widgets/widget-popup.css";

export function ConfigurableReviewWidget({ data, config: initialConfig, creditUrl, interactive = true }: {
    data: PublicWidgetData; config: WidgetConfig; creditUrl: string; interactive?: boolean;
}) {
    const root = useRef<HTMLDivElement>(null);
    const [previewConfig, setPreviewConfig] = useState<WidgetConfig | null>(null);
    const config = previewConfig || initialConfig;
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState(false);
    const [selected, setSelected] = useState<string>();
    const [photo, setPhoto] = useState<{ review: PublicWidgetReview; index: number } | null>(null);
    const { reviews, count, rating } = widgetPresentation(data, config);
    const badge = isBadgeLayout(config.layout);
    const expanded = open || !!photo;
    useEffect(() => {
        if (!interactive) return;
        const receive = (event: MessageEvent) => {
            if (!trustedWidgetPreviewMessage(event, window.parent, window.location.origin)) return;
            setPreview(true); setPreviewConfig(parseWidgetConfig(event.data.config)); setOpen(false); setPhoto(null);
        };
        window.addEventListener("message", receive);
        window.parent.postMessage({ type: "zyene-widget-ready", summarySources: Object.keys(data.summaries || {}) .filter(source => !!data.summaries?.[source as "google" | "all"]) }, "*");
        return () => window.removeEventListener("message", receive);
    }, [interactive, data.summaries]);
    useEffect(() => {
        const node = root.current;
        if (!node || !interactive) return;
        let frame = 0;
        const send = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => window.parent.postMessage({ type: "zyene-widget-size",
                height: Math.ceil(node.getBoundingClientRect().height), expanded,
                width: badge ? Math.ceil((node.querySelector(".rw-badge")?.getBoundingClientRect().width || 280) + 40) : undefined,
            }, "*"));
        };
        const observer = new ResizeObserver(send); observer.observe(node); send();
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    }, [expanded, interactive, badge]);
    const show = (id?: string) => { setSelected(id); setOpen(true); };
    const showPhoto = (review: PublicWidgetReview, index: number) => setPhoto({ review, index });
    return <div ref={root} className={`rw-root rw-theme-${config.theme} ${badge ? "rw-badge-root" : ""} ${preview && badge ? config.floating ? "rw-preview-floating" : "rw-preview-badge" : ""}`} data-position={config.position} data-preset={config.preset} style={widgetStyle(config)} dir={config.rtl ? "rtl" : "ltr"}>
        {badge ? <WidgetBadgeLayout config={config} rating={rating} count={count} businessName={data.businessName} writeReviewUrl={data.writeReviewUrl} reviews={reviews} onOpen={() => show()} /> :
            <section aria-label={`Reviews for ${data.businessName}`}>
                {config.showTitle && <div className="rw-heading"><h2>{config.title || data.businessName}</h2>{config.caption && <p>{config.caption}</p>}</div>}
                {config.showHeader && <WidgetHeader config={config} rating={rating} count={count} businessName={data.businessName} writeReviewUrl={data.writeReviewUrl} />}
                <WidgetReviewFeed key={`${config.layout}:${config.preset}:${config.source}:${config.sort}:${config.minRating}:${config.exclude}:${config.textOnly}`} reviews={reviews} config={config} summary={data.summaries?.[config.source] || data.summary} rating={rating} onOpen={show} onPhoto={showPhoto} />
            </section>}
        {interactive && <><WidgetReviewsDialog open={open} selected={selected} reviews={reviews} config={config} data={data} rating={rating} count={count} onClose={() => setOpen(false)} onPhoto={showPhoto} />
            <WidgetPhotoDialog selection={photo} onClose={() => setPhoto(null)} /></>}
        {!data.hideBranding && <a className="rw-credit" href={creditUrl} target="_blank" rel="noopener noreferrer">Free review widget by <strong>Zyene</strong></a>}
    </div>;
}
