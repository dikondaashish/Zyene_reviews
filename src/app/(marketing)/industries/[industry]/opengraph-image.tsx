import { ImageResponse } from "next/og";
import { INDUSTRY_MAP } from "@/lib/phase3/industry-data";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata(
    { params }: { params: Promise<{ industry: string }> }
) {
    const { industry } = await params;
    const data = INDUSTRY_MAP[industry];
    return [{ id: "og", alt: data ? `${data.name} Review Management — Zyene Reviews` : "Industry Solutions — Zyene Reviews" }];
}

export default async function OgImage(
    { params }: { params: Promise<{ industry: string }> }
) {
    const { industry } = await params;
    const data = INDUSTRY_MAP[industry];
    const name = data?.name ?? "Industry";
    const emoji = data?.emoji ?? "⭐";

    return new ImageResponse(
        (
            <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a0f0f 0%, #2d1515 50%, #1a0f0f 100%)", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
                <div style={{ position: "absolute", top: "5%", left: "5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", position: "relative", zIndex: 10 }}>
                    <div style={{ fontSize: "80px", marginBottom: "16px" }}>{emoji}</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>ZYENE REVIEWS · INDUSTRIES</div>
                    <div style={{ fontSize: "52px", fontWeight: "800", color: "#ffffff", lineHeight: "1.1", marginBottom: "20px" }}>
                        Review Management<br />Built for <span style={{ color: "#4ade80" }}>{name}</span>
                    </div>
                    <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)", marginBottom: "24px" }}>AI replies · Negative Feedback Shield · Competitor tracking</div>
                    <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "12px", padding: "10px 24px", color: "#4ade80", fontSize: "17px", fontWeight: "700" }}>
                        Starting at $29.99/mo — 7-day free trial
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
