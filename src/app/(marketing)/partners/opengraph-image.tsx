import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Partners—Zyene Reviews";
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
                }}
            >
                <div style={{ fontSize: "18px", fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "24px" }}>
                    ZYENE REVIEWS
                </div>
                <div style={{ fontSize: "60px", fontWeight: 700, color: "#ffffff", marginBottom: "24px" }}>
                    <span style={{ color: "#4ade80" }}>Partners</span> &amp; Agencies
                </div>
                <div style={{ fontSize: "24px", color: "rgba(255,255,255,0.55)", maxWidth: "800px", textAlign: "center" }}>
                    Referral program · POS integrations · Zapier · Co-marketing
                </div>
            </div>
        ),
        { ...size }
    );
}
