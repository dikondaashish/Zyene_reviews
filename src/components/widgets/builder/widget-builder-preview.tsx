"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { buildConfiguredEmbed } from "@/lib/widgets/configured-embed";
import { isBadgeLayout, type WidgetConfig } from "@/lib/widgets/config";
import { WIDGET_COLORS } from "@/lib/widgets/palette";
import { WidgetPreviewSkeleton } from "@/components/widgets/widget-preview-skeleton";

export function WidgetBuilderPreview({ slug, config, onSetupSummary }: { slug: string; config: WidgetConfig; onSetupSummary: () => void }) {
    const [mobile, setMobile] = useState(false);
    const [height, setHeight] = useState(650);
    const [ready, setReady] = useState(false);
    const [summarySources, setSummarySources] = useState<string[]>([]);
    const [availableHeight, setAvailableHeight] = useState(540);
    const scrollArea = useRef<HTMLDivElement>(null);
    const [src] = useState(() => {
        const url = buildConfiguredEmbed(slug, config).url;
        return process.env.NODE_ENV === "development" ? `/w/${encodeURIComponent(slug)}${new URL(url).search}` : url;
    });
    const frame = useRef<HTMLIFrameElement>(null);
    const latest = useRef(config);
    useEffect(() => { latest.current = config; }, [config]);
    useEffect(() => {
        const node = scrollArea.current;
        if (!node) return;
        const measure = () => setAvailableHeight(Math.max(260, node.clientHeight - 40));
        const observer = new ResizeObserver(measure); observer.observe(node); measure();
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const origin = new URL(src, window.location.origin).origin;
        const receive = (event: MessageEvent) => {
            if (event.source !== frame.current?.contentWindow || event.origin !== origin) return;
            if (event.data?.type === "zyene-widget-ready") {
                setReady(true); frame.current?.contentWindow?.postMessage({ type: "zyene-widget-config", config: latest.current }, origin);
                setSummarySources(Array.isArray(event.data.summarySources) ? event.data.summarySources.filter((source: unknown) => source === "google" || source === "all") : []);
            }
            if (event.data?.type === "zyene-widget-size" && Number.isFinite(event.data.height)) setHeight(Math.max(120, Math.min(10000, event.data.height)));
        };
        window.addEventListener("message", receive);
        return () => window.removeEventListener("message", receive);
    }, [src]);
    useEffect(() => {
        if (ready) frame.current?.contentWindow?.postMessage({ type: "zyene-widget-config", config }, new URL(src, window.location.origin).origin);
    }, [config, ready, src]);
    const floating = config.floating && isBadgeLayout(config.layout);
    return <section className="wb-preview" aria-label="Live widget preview">
        <div className="wb-preview-toolbar"><span>Live preview</span><div>
            {config.showSummary && !isBadgeLayout(config.layout) && !summarySources.includes(config.source) && <button className="wb-setup-summary" onClick={onSetupSummary}>Generate AI summary</button>}
            <button title="Desktop preview" aria-label="Desktop preview" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={18} /></button>
            <button title="Mobile preview" aria-label="Mobile preview" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={18} /></button>
        </div></div>
        <div className="wb-preview-scroll" ref={scrollArea}><div className={`wb-preview-device ${mobile ? "wb-mobile" : ""} ${floating ? "wb-floating-preview" : ""}`} aria-busy={!ready}
            style={{ background: ["dark", "outline-dark", "deep-tint"].includes(config.theme) ? WIDGET_COLORS.darkBackground : WIDGET_COLORS.lightBackground }}>
            {!ready && <div className="absolute inset-0 z-10 overflow-hidden bg-card"><WidgetPreviewSkeleton badge={isBadgeLayout(config.layout)} /></div>}
            <iframe ref={frame} src={src} title="Live customer reviews widget" onLoad={() => setReady(true)} aria-hidden={!ready} tabIndex={!ready ? -1 : undefined}
                style={{ height: isBadgeLayout(config.layout) ? availableHeight : height, visibility: ready ? "visible" : "hidden" }} />
        </div></div>
        <p className="wb-preview-note">Preview uses your business’s visible, synced reviews.</p>
    </section>;
}
