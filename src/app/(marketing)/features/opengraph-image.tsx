import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Features — Zyene Reviews. Review management built for local businesses.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ position: "absolute", top: "5%", right: "10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px" }}>ZYENE REVIEWS · FEATURES</div>
                    <div style={{ fontSize: "58px", fontWeight: "800", color: "#ffffff", lineHeight: "1.05", marginBottom: "20px" }}>
                        Everything you need to own your<br /><span style={{ color: "#4ade80" }}>online reputation</span>
                    </div>
                    <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.55)", marginBottom: "36px" }}>AI replies · Review collection · Competitor tracking · Local SEO</div>
                    <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "12px", padding: "12px 28px", color: "#4ade80", fontSize: "18px", fontWeight: "700" }}>
                        Starting at $29.99/mo — 7-day free trial
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
