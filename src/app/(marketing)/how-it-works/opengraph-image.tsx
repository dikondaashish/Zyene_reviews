import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "How It Works ,  Zyene Reviews. 4 steps to more 5-star reviews.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px" }}>ZYENE REVIEWS · HOW IT WORKS</div>
                    <div style={{ fontSize: "58px", fontWeight: "800", color: "#ffffff", lineHeight: "1.05", marginBottom: "24px" }}>
                        Up &amp; running in<br /><span style={{ color: "#4ade80" }}>under 10 minutes</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
                        {["01 Connect", "02 Monitor", "03 Collect", "04 Grow"].map((s) => (
                            <div key={s} style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "10px", padding: "10px 18px", color: "rgba(255,255,255,0.8)", fontSize: "15px", fontWeight: "600" }}>{s}</div>
                        ))}
                    </div>
                    <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>No tech skills required · 7-day free trial</div>
                </div>
            </div>
        ),
        { ...size }
    );
}
