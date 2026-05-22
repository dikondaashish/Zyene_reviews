import { ImageResponse } from "next/og";
import { RESOURCE_MAP } from "@/lib/phase4/resource-data";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ guide: string }> }) {
    const { guide } = await params;
    const resource = RESOURCE_MAP[guide];
    return [{ id: guide, alt: resource?.metaTitle ?? "Zyene Reviews Resource Guide" }];
}

export default async function OgImage({ params }: { params: Promise<{ guide: string }> }) {
    const { guide } = await params;
    const resource = RESOURCE_MAP[guide];
    const title = resource?.title ?? "Free Guide";
    const subtitle = resource?.subtitle ?? "Zyene Reviews";
    const readTime = resource ? `${resource.readMinutes} min read` : "";

    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "linear-gradient(135deg, #0f1a1a 0%, #152d2d 60%, #0f1a1a 100%)", fontFamily: "system-ui, -apple-system, sans-serif", padding: "0", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #22d3ee, #0ea5e9)" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 72px", position: "relative", zIndex: 10 }}>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
                        <div style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)", borderRadius: "8px", padding: "6px 16px", color: "#22d3ee", fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase" }}>Free Guide</div>
                        {readTime && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{readTime}</div>}
                    </div>
                    <div style={{ fontSize: title.length > 55 ? "36px" : "44px", fontWeight: "800", color: "#ffffff", lineHeight: "1.15", marginBottom: "16px", maxWidth: "900px" }}>{title}</div>
                    <div style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", maxWidth: "800px", lineHeight: "1.5" }}>{subtitle.slice(0, 100)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "32px" }}>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)" }}>ZYENE REVIEWS</div>
                        <div style={{ color: "rgba(255,255,255,0.25)" }}>·</div>
                        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>zyenereviews.com/resources</div>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
