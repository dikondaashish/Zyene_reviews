import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pricing—Zyene Reviews. Starting at $29.99/mo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px", height: "630px", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)",
                    fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden",
                }}
            >
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ position: "absolute", top: "10%", left: "15%", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px" }}>ZYENE REVIEWS · PRICING</div>
                    <div style={{ fontSize: "62px", fontWeight: "800", color: "#ffffff", lineHeight: "1.05", marginBottom: "20px", letterSpacing: "-0.02em" }}>
                        Simple, <span style={{ color: "#4ade80" }}>Transparent</span> Pricing
                    </div>
                    <div style={{ fontSize: "22px", color: "rgba(255,255,255,0.55)", marginBottom: "36px" }}>No annual contracts · No hidden fees · Cancel anytime</div>
                    <div style={{ display: "flex", gap: "16px" }}>
                        {[
                            { label: "Starter", price: "$29.99/mo" },
                            { label: "Professional", price: "$59.99/mo" },
                            { label: "Enterprise", price: "Custom" },
                        ].map((plan) => (
                            <div key={plan.label} style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "14px", padding: "16px 24px", textAlign: "center" }}>
                                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>{plan.label}</div>
                                <div style={{ fontSize: "22px", fontWeight: "700", color: "#4ade80" }}>{plan.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
