import { ImageResponse } from "next/og";
import { BLOG_POST_MAP, BLOG_SLUGS, PILLAR_LABELS } from "@/lib/phase4/blog-data";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = BLOG_POST_MAP[slug];
    return [{ id: slug, alt: post?.metaTitle ?? "Zyene Reviews Blog" }];
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = BLOG_POST_MAP[slug];
    const title = post?.title ?? "Zyene Reviews Blog";
    const pillar = post ? PILLAR_LABELS[post.pillar] : "Blog";
    const read = post ? `${post.readMinutes} min read` : "";

    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 60%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", padding: "0", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #4ade80, #22c55e)" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 72px", position: "relative", zIndex: 10 }}>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
                        <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "8px", padding: "6px 16px", color: "#4ade80", fontSize: "13px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase" }}>{pillar}</div>
                        {read && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{read}</div>}
                    </div>
                    <div style={{ fontSize: title.length > 60 ? "38px" : "46px", fontWeight: "800", color: "#ffffff", lineHeight: "1.15", marginBottom: "24px", maxWidth: "900px" }}>{title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.5)" }}>ZYENE REVIEWS</div>
                        <div style={{ color: "rgba(255,255,255,0.3)" }}>·</div>
                        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>zyenereviews.com/blog</div>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
