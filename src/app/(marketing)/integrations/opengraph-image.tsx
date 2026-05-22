import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Integrations — Zyene Reviews. Connects with Google, Facebook, Yelp, Zapier, and more.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px" }}>ZYENE REVIEWS · INTEGRATIONS</div>
                    <div style={{ fontSize: "58px", fontWeight: "800", color: "#ffffff", lineHeight: "1.05", marginBottom: "24px" }}>
                        Connects with the tools<br /><span style={{ color: "#4ade80" }}>you already use</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", justifyContent: "center" }}>
                        {[
                            { name: "Google", color: "#4285F4" },
                            { name: "Facebook", color: "#1877F2" },
                            { name: "Yelp", color: "#D32323" },
                            { name: "Zapier", color: "#FF4A00" },
                            { name: "Square", color: "#006AFF" },
                            { name: "API", color: "#6B7280" },
                        ].map((i) => (
                            <div key={i.name} style={{ background: i.color + "22", border: `1px solid ${i.color}44`, borderRadius: "10px", padding: "8px 16px", color: "#ffffff", fontSize: "14px", fontWeight: "600" }}>{i.name}</div>
                        ))}
                    </div>
                    <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>All integrations included · No extra cost</div>
                </div>
            </div>
        ),
        { ...size }
    );
}
