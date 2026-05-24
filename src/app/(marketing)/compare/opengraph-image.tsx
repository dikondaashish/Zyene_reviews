import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Compare Zyene Reviews vs Birdeye, Podium, NiceJob, GatherUp—2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px" }}>ZYENE REVIEWS · HONEST COMPARISONS</div>
                    <div style={{ fontSize: "58px", fontWeight: "800", color: "#ffffff", lineHeight: "1.05", marginBottom: "24px" }}>
                        See how Zyene Reviews<br /><span style={{ color: "#4ade80" }}>compares to the rest</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                        {["vs Birdeye $299/mo", "vs Podium $399/mo", "vs NiceJob $75/mo", "vs GatherUp $99/mo"].map((c) => (
                            <div key={c} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "8px 14px", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600" }}>{c}</div>
                        ))}
                    </div>
                    <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "12px", padding: "10px 24px", color: "#4ade80", fontSize: "17px", fontWeight: "700" }}>
                        Zyene Reviews starts at $29.99/mo—no annual contract
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
