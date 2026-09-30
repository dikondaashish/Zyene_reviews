"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { buildConfiguredEmbed } from "@/lib/widgets/configured-embed";
import { isBadgeLayout, type WidgetConfig } from "@/lib/widgets/config";
import { WidgetPreviewSkeleton } from "@/components/widgets/widget-preview-skeleton";

export function WidgetBuilderPreview({ slug, config }: { slug: string; config: WidgetConfig }) {
    const [mobile, setMobile] = useState(false);
    const [height, setHeight] = useState(650);
    const [previewConfig, setPreviewConfig] = useState(config);
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const frame = useRef<HTMLIFrameElement>(null);
    useEffect(() => {
        const timer = setTimeout(() => setPreviewConfig(config), 250);
        return () => clearTimeout(timer);
    }, [config]);
    const embed = buildConfiguredEmbed(slug, previewConfig);
    const src = process.env.NODE_ENV === "development" ? `/w/${encodeURIComponent(slug)}${new URL(embed.url).search}` : embed.url;
    const loading = config !== previewConfig || loadedSrc !== src;
    useEffect(() => {
        const origin = new URL(src, window.location.origin).origin;
        const receive = (event: MessageEvent) => {
            if (event.source !== frame.current?.contentWindow || event.origin !== origin) return;
            if (event.data?.type === "zyene-widget-size" && Number.isFinite(event.data.height)) setHeight(Math.max(180, Math.min(10000, event.data.height)));
        };
        window.addEventListener("message", receive);
        return () => window.removeEventListener("message", receive);
    }, [src]);
    return <section className="wb-preview" aria-label="Live widget preview">
        <div className="wb-preview-toolbar"><span>Live preview</span><div>
            <button title="Desktop preview" aria-label="Desktop preview" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={18} /></button>
            <button title="Mobile preview" aria-label="Mobile preview" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={18} /></button>
        </div></div>
        <div className="wb-preview-scroll"><div className={`wb-preview-device ${mobile ? "wb-mobile" : ""}`} aria-busy={loading} style={{ position: "relative" }}>
            {loading && <div className="absolute inset-0 z-10 overflow-hidden bg-card"><WidgetPreviewSkeleton badge={isBadgeLayout(config.layout)} /></div>}
            <iframe key={src} ref={frame} src={src} title="Live customer reviews widget" onLoad={() => setLoadedSrc(src)} aria-hidden={loading} tabIndex={loading ? -1 : undefined} style={{ height, visibility: loading ? "hidden" : "visible" }} />
        </div></div>
        <p className="wb-preview-note">{config.floating ? "Floating placement activates on your website with the installation script." : "Preview uses your business’s visible, synced reviews."}</p>
    </section>;
}
