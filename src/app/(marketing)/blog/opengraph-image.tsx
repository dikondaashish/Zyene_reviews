import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Blog ,  Review Management & Local SEO | Zyene Reviews";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px" }}>ZYENE REVIEWS · BLOG</div>
                    <div style={{ fontSize: "56px", fontWeight: "800", color: "#ffffff", lineHeight: "1.1", marginBottom: "20px" }}>
                        Review management &<br /><span style={{ color: "#4ade80" }}>local SEO insights</span>
                    </div>
                    <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)", marginBottom: "24px" }}>Practical guides for local business owners</div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                        {["Google Reviews", "Local SEO", "Responding to Reviews", "Reputation Management"].map((t) => (
                            <div key={t} style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "8px", padding: "7px 14px", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600" }}>{t}</div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
