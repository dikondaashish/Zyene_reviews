import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Resources ,  Free Guides for Local Business Owners | Zyene Reviews";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f1a1a 0%, #152d2d 50%, #0f1a1a 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px" }}>ZYENE REVIEWS · FREE GUIDES</div>
                    <div style={{ fontSize: "54px", fontWeight: "800", color: "#ffffff", lineHeight: "1.1", marginBottom: "20px" }}>
                        The <span style={{ color: "#22d3ee" }}>complete playbooks</span><br />for local business owners
                    </div>
                    <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
                        {["📗 Google Reviews Guide", "📕 Negative Review Templates", "📘 Local SEO Checklist", "📙 Review Request Templates"].map((g) => (
                            <div key={g} style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", borderRadius: "8px", padding: "8px 14px", color: "rgba(255,255,255,0.65)", fontSize: "12px", fontWeight: "600" }}>{g}</div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
