import { ImageResponse } from "next/og";
import { COMPETITOR_MAP } from "@/lib/phase3/competitor-data";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata(
    { params }: { params: Promise<{ competitor: string }> }
) {
    const { competitor } = await params;
    const data = COMPETITOR_MAP[competitor];
    return [{ id: "og", alt: data ? `Zyene Reviews vs ${data.name} — 2026 Comparison` : "Compare Zyene Reviews" }];
}

export default async function OgImage(
    { params }: { params: Promise<{ competitor: string }> }
) {
    const { competitor } = await params;
    const data = COMPETITOR_MAP[competitor];
    const name = data?.name ?? "Competitor";
    const price = data?.price ?? "$???";

    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>ZYENE REVIEWS · COMPARISON 2026</div>
                    <div style={{ fontSize: "62px", fontWeight: "800", color: "#ffffff", lineHeight: "1.05", marginBottom: "24px" }}>
                        Zyene vs <span style={{ color: "#4ade80" }}>{name}</span>
                    </div>
                    <div style={{ display: "flex", gap: "32px", alignItems: "center", marginBottom: "24px" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "40px", fontWeight: "900", color: "#4ade80" }}>$29.99</div>
                            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>Zyene / month</div>
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: "700", color: "rgba(255,255,255,0.2)" }}>vs</div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "40px", fontWeight: "900", color: "rgba(255,255,255,0.5)" }}>{price}</div>
                            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>{name} / month</div>
                        </div>
                    </div>
                    <div style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)" }}>Full feature comparison · Honest analysis · 2026</div>
                </div>
            </div>
        ),
        { ...size }
    );
}
