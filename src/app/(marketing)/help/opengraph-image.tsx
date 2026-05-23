import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Help Center—Zyene Reviews";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ position: "absolute", top: "5%", right: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(74,222,128,0.10) 0%, transparent 70%)", borderRadius: "50%" }} />

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10, gap: "0px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "600", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "24px" }}>
                        ZYENE REVIEWS
                    </div>
                    <div style={{ fontSize: "60px", fontWeight: "700", color: "#ffffff", lineHeight: "1.1", marginBottom: "24px", letterSpacing: "-0.02em" }}>
                        <span style={{ color: "#4ade80" }}>Help Center</span>
                    </div>
                    <div style={{ fontSize: "24px", color: "rgba(255,255,255,0.55)", lineHeight: "1.5", maxWidth: "760px" }}>
                        Guides, tutorials, and answers—Getting Started, Analytics, Campaigns, Billing, and Integrations
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
