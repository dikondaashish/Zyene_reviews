import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Review Management for Every Industry — Zyene Reviews";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px" }}>ZYENE REVIEWS · INDUSTRY SOLUTIONS</div>
                    <div style={{ fontSize: "58px", fontWeight: "800", color: "#ffffff", lineHeight: "1.05", marginBottom: "24px" }}>
                        Review management built<br /><span style={{ color: "#4ade80" }}>for your industry</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", justifyContent: "center" }}>
                        {["🍽️ Restaurants", "🦷 Dental", "🔧 Auto Repair", "💅 Salons", "🏠 Home Services", "🏥 Medical", "🏨 Hotels", "💪 Fitness"].map((item) => (
                            <div key={item} style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "10px", padding: "8px 14px", color: "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: "600" }}>{item}</div>
                        ))}
                    </div>
                    <div style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)" }}>Starting at $29.99/mo — 7-day free trial</div>
                </div>
            </div>
        ),
        { ...size }
    );
}
