import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Zyene Reviews — Reputation Management for Local Businesses";
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
                {/* Subtle grid pattern overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Glow orbs */}
                <div
                    style={{
                        position: "absolute",
                        top: "10%",
                        left: "10%",
                        width: "400px",
                        height: "400px",
                        background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)",
                        borderRadius: "50%",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "5%",
                        right: "5%",
                        width: "300px",
                        height: "300px",
                        background: "radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)",
                        borderRadius: "50%",
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        padding: "0 80px",
                        position: "relative",
                        zIndex: 10,
                        gap: "0px",
                    }}
                >
                    {/* Logo mark */}
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            background: "rgba(74,222,128,0.15)",
                            border: "1px solid rgba(74,222,128,0.3)",
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "28px",
                            fontSize: "32px",
                        }}
                    >
                        ⭐
                    </div>

                    {/* Brand */}
                    <div
                        style={{
                            fontSize: "22px",
                            fontWeight: "600",
                            color: "rgba(255,255,255,0.5)",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            marginBottom: "20px",
                        }}
                    >
                        ZYENE REVIEWS
                    </div>

                    {/* Main headline */}
                    <div
                        style={{
                            fontSize: "56px",
                            fontWeight: "700",
                            color: "#ffffff",
                            lineHeight: "1.1",
                            marginBottom: "24px",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Reputation Management
                        <br />
                        <span style={{ color: "#4ade80" }}>for Local Businesses</span>
                    </div>

                    {/* Sub */}
                    <div
                        style={{
                            fontSize: "22px",
                            color: "rgba(255,255,255,0.55)",
                            lineHeight: "1.5",
                            maxWidth: "800px",
                            marginBottom: "40px",
                        }}
                    >
                        Monitor, respond with AI, and collect more 5-star Google reviews
                    </div>

                    {/* Pills */}
                    <div style={{ display: "flex", gap: "12px" }}>
                        {["Starting at $29.99/mo", "7-day free trial", "No annual contract"].map(
                            (pill) => (
                                <div
                                    key={pill}
                                    style={{
                                        background: "rgba(74,222,128,0.1)",
                                        border: "1px solid rgba(74,222,128,0.25)",
                                        borderRadius: "100px",
                                        padding: "8px 20px",
                                        fontSize: "16px",
                                        color: "#4ade80",
                                        fontWeight: "500",
                                    }}
                                >
                                    {pill}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
