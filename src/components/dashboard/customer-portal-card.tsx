"use client";

import { useState, useEffect } from "react";
import { Download, Printer, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CustomerPortalCardProps {
    businessId: string;
    businessSlug: string;
    businessName: string;
    businessLogoUrl?: string | null;
    brandColor?: string | null;
    reviewPageBackgroundColor?: string | null;
}

/** Resolve a brand color: if truthy, use it; otherwise fall back to a refined dark default. */
function resolveBrandColor(color?: string | null): string {
    return color && /^#([0-9a-fA-F]{3}){1,6}$/.test(color) ? color : "#223122";
}

/** Compute a readable text color (white or dark) for a hex background. */
function contrastText(hex: string): string {
    if (!hex.startsWith("#")) return "#ffffff";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Relative luminance (sRGB)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
}

const GOOGLE_G_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTI0IDkuNWMzLjU0IDAgNi43MSAxLjIyIDkuMjEgMy42bDYuODUtNi44NUMzNS45IDIuMzggMzAuNDcgMCAyNCAwIDE0LjYyIDAgNi41MSA1LjM4IDIuNTYgMTMuMjJsNy45OCA2LjE5QzEyLjQzIDEzLjcyIDE3Ljc0IDkuNSAyNCA5LjV6Ii8+PHBhdGggZmlsbD0iIzQyODVGNCIgZD0iTTQ2Ljk4IDI0LjU1YzAtMS41Ny0uMTUtMy4wOS0uMzgtNC41NUgyNHY5LjAyaDEyLjk0Yy0uNTggMi45Ni0yLjI2IDUuNDgtNC43OCA3LjE4bDcuNzMgNmM0LjUxLTQuMTggNy4wOS0xMC4zNiA3LjA5LTE3LjY1eiIvPjxwYXRoIGZpbGw9IiNGQkJDMDUiIGQ9Ik0xMC41MyAyOC41OWMtLjQ4LTEuNDUtLjc2LTIuOTktLjc2LTQuNTlzLjI3LTMuMTQuNzYtNC41OWwtNy45OC02LjE5Qy45MiAxNi40NiAwIDIwLjEyIDAgMjRjMCAzLjg4LjkyIDcuNTQgMi41NiAxMC43OGw3Ljk3LTYuMTl6Ii8+PHBhdGggZmlsbD0iIzM0QTg1MyIgZD0iTTI0IDQ4YzYuNDggMCAxMS45My0yLjEzIDE1Ljg5LTUuODFsLTcuNzMtNmMtMi4xNSAxLjQ1LTQuOTIgMi4zLDguMTYgMi4zLTYuMjYgMC0xMS41Ny00LjIyLTEzLjQ3LTkuOTFsLTcuOTggNi4xOUM2LjUxIDQyLjYyIDE0LjYyIDQ4IDI0IDQ4eiIvPjwvc3ZnPg==";

export function CustomerPortalCard({ 
    businessSlug, 
    businessId,
    businessName,
    businessLogoUrl,
    brandColor,
    reviewPageBackgroundColor
}: CustomerPortalCardProps) {
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const domain = "www.collectratings.com";
    const portalUrl = `https://${domain}/${businessSlug}`;
    const resolvedBrand = resolveBrandColor(brandColor);
    const resolvedBg = resolveBrandColor(reviewPageBackgroundColor || brandColor); // Fallback chain
    const resolvedFg = contrastText(resolvedBg);

    useEffect(() => {
        if (!businessId) return;
        const fetchQr = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/businesses/${businessId}/qr-code`);
                if (res.ok) {
                    const data = await res.json();
                    setQrDataUrl(data.qrCodeDataUrl);
                }
            } catch (e) {
                console.error("Failed to load QR code", e);
            } finally {
                setLoading(false);
            }
        };
        fetchQr();
    }, [businessId]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(portalUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Leave us a review!",
                    url: portalUrl,
                });
                return;
            } catch {}
        }
        handleCopyLink();
    };

    /* ───────── Branded Download (Canvas) ───────── */
    const handleDownload = () => {
        if (!qrDataUrl) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // High-resolution scaling (4x)
        const scale = 4;
        const baseW = 600;
        const W = baseW * scale;
        
        const accent = resolvedBrand;
        const posterBg = resolvedBg;
        const posterFg = resolvedFg; // Use resolved contrast color
        // Helper to draw rounded rect with scaling
        const roundRect = (x: number, y: number, w: number, h: number, r: number | number[]) => {
            ctx.beginPath();
            if (Array.isArray(r)) {
                ctx.roundRect(x * scale, y * scale, w * scale, h * scale, r.map(v => v * scale));
            } else {
                ctx.roundRect(x * scale, y * scale, w * scale, h * scale, r * scale);
            }
        };

        const drawCard = (logo: HTMLImageElement | null, googleIcon: HTMLImageElement) => {
            let baseH = 50; 
            let lh = 0, lw = 0;
            if (logo) {
                const maxLogoH = 64, maxLogoW = 200;
                const imgScale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height, 1);
                lw = logo.width * imgScale;
                lh = logo.height * imgScale;
                baseH += 10 + lh + 16;
            } else {
                baseH += 20;
            }
            baseH += 80 + 20 + 108 + 328 + 36 + 30 + 30;

            const H = baseH * scale;
            canvas.width = W;
            canvas.height = H;

            // Fill background
            roundRect(0, 0, baseW, baseH, 24);
            ctx.fillStyle = posterBg;
            ctx.fill();

            // Inner border
            roundRect(20, 20, baseW - 40, baseH - 40, 16);
            ctx.strokeStyle = posterFg === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
            ctx.lineWidth = 1.5 * scale;
            ctx.stroke();

            let cursorY = 50;
            if (logo) {
                ctx.drawImage(logo, ((baseW - lw) / 2) * scale, (cursorY + 10) * scale, lw * scale, lh * scale);
                cursorY += lh + 26;
            } else {
                cursorY += 20;
            }

            ctx.fillStyle = posterFg;
            ctx.font = `bold ${32 * scale}px 'Inter', 'Segoe UI', system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(businessName || "Business", W / 2, (cursorY + 32) * scale);
            cursorY += 52;

            ctx.strokeStyle = posterFg === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(60 * scale, cursorY * scale);
            ctx.lineTo((baseW - 60) * scale, cursorY * scale);
            ctx.stroke();
            cursorY += 20;

            const ctaText = "Scan to Leave Us a Google Review";
            ctx.font = `600 ${16 * scale}px 'Inter', 'Segoe UI', system-ui, sans-serif`;
            const ctaMetrics = ctx.measureText(ctaText);
            const iconSize = 24, gap = 10;
            const pillW = iconSize + gap + (ctaMetrics.width / scale) + 56, pillH = 48;
            const pillX = (baseW - pillW) / 2;
            
            roundRect(pillX, cursorY, pillW, pillH, pillH / 2);
            ctx.fillStyle = posterFg === "#ffffff" ? "#000000" : "rgba(0,0,0,0.85)"; // Keep CTA dark for contrast
            ctx.fill();
            
            ctx.drawImage(googleIcon, (pillX + 28) * scale, (cursorY + (pillH - iconSize) / 2) * scale, iconSize * scale, iconSize * scale);
            
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "left";
            ctx.fillText(ctaText, (pillX + 28 + iconSize + gap) * scale, (cursorY + 30) * scale);
            cursorY += pillH + 16;

            const drawStar = (cx: number, cy: number) => {
                let rot = Math.PI / 2 * 3, x = cx, y = cy, step = Math.PI / 5;
                ctx.beginPath(); 
                ctx.moveTo(cx * scale, (cy - 11) * scale);
                for (let i = 0; i < 5; i++) {
                    x = cx + Math.cos(rot) * 11; y = cy + Math.sin(rot) * 11; ctx.lineTo(x * scale, y * scale); rot += step;
                    x = cx + Math.cos(rot) * 5; y = cy + Math.sin(rot) * 5; ctx.lineTo(x * scale, y * scale); rot += step;
                }
                ctx.closePath(); ctx.fillStyle = "#FFC107"; ctx.fill();
            };
            const starStartX = (baseW - (4 * 30)) / 2;
            for (let i = 0; i < 5; i++) drawStar(starStartX + (i * 30), cursorY + 11);
            cursorY += 24 + 18;

            const qrImg = new Image();
            qrImg.onload = () => {
                const qrSize = 300, qrX = (baseW - qrSize) / 2;
                roundRect(qrX - 12, cursorY - 12, qrSize + 24, qrSize + 24, 16);
                ctx.fillStyle = "#ffffff"; 
                ctx.fill();
                
                ctx.imageSmoothingEnabled = false; // Keep QR sharp
                ctx.drawImage(qrImg, qrX * scale, cursorY * scale, qrSize * scale, qrSize * scale);
                cursorY += qrSize + 36;
                
                ctx.fillStyle = posterFg === "#ffffff" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)";
                ctx.font = `500 ${16 * scale}px 'Inter', 'Segoe UI', system-ui, sans-serif`;
                ctx.textAlign = "center";
                ctx.fillText(`${domain}/${businessSlug}`, W / 2, cursorY * scale);
                cursorY += 32;
                
                ctx.fillStyle = posterFg === "#ffffff" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
                ctx.font = `bold ${15 * scale}px 'Inter', 'Segoe UI', system-ui, sans-serif`;
                ctx.fillText("Powered by Zyene Reviews", W / 2, cursorY * scale);

                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png", 1.0);
                link.download = `${businessSlug}-qr-poster.png`;
                link.click();
                toast.success("High-quality QR code downloaded!");
            };
            qrImg.src = qrDataUrl;
        };

        const googleImg = new Image();
        googleImg.crossOrigin = "anonymous";
        googleImg.onload = () => {
            if (businessLogoUrl) {
                const logoImg = new Image();
                logoImg.crossOrigin = "anonymous";
                logoImg.onload = () => drawCard(logoImg, googleImg);
                logoImg.onerror = () => drawCard(null, googleImg);
                logoImg.src = businessLogoUrl;
            } else {
                drawCard(null, googleImg);
            }
        };
        googleImg.src = GOOGLE_G_SVG;
    };

    /* ───────── Branded Print (HTML popup) ───────── */
    /* ───────── Branded Print (HTML popup) ───────── */
    const handlePrint = () => {
        const printWindow = window.open("", "_blank", "width=600,height=800");
        if (!printWindow) return toast.error("Please allow popups to print.");

        const posterBg = resolvedBg;
        const posterFg = resolvedFg;
        const logoHtml = businessLogoUrl ? `<img src="${businessLogoUrl}" alt="${businessName}" class="logo" crossorigin="anonymous" />` : "";

        printWindow.document.write(`
            <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Inter', system-ui, sans-serif; 
                            background: #f5f5f5; 
                            display: flex; justify-content: center; align-items: flex-start;
                            padding: 40px;
                        }
                        .card { 
                            background: ${posterBg} !important; 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                            border-radius: 40px; 
                            overflow: hidden; 
                            width: 600px; 
                            box-shadow: 0 4px 50px rgba(0,0,0,0.15); 
                            text-align: center; 
                            color: ${posterFg} !important; 
                            padding: 60px 40px; 
                            border: 12px solid ${posterFg === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
                            page-break-inside: avoid;
                        }
                        .logo { max-height: 70px; max-width: 250px; object-fit: contain; margin-bottom: 20px; }
                        .biz-name { font-size: 32px; font-weight: 700; margin-bottom: 20px; line-height: 1.2; }
                        .divider { height: 1px; background: ${posterFg === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}; margin: 0 40px 30px; }
                        .cta-pill { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 14px 36px; border-radius: 999px; background: ${posterFg === "#ffffff" ? "#000" : "rgba(0,0,0,0.85)"}; color: #fff; font-weight: 600; font-size: 16px; margin-bottom: 30px; }
                        .cta-pill img { width: 24px; height: 24px; }
                        .stars { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; }
                        .stars svg { width: 28px; height: 28px; }
                        .qr-frame { display: inline-block; border-radius: 20px; background: #ffffff; padding: 16px; margin-bottom: 30px; }
                        .qr-frame img { width: 340px; height: 340px; image-rendering: pixelated; display: block; }
                        .url { color: ${posterFg === "#ffffff" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}; font-size: 16px; margin-bottom: 20px; font-weight: 500; }
                        .powered { font-weight: 700; font-size: 13px; color: ${posterFg === "#ffffff" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}; letter-spacing: 1px; }
                        @media print { 
                            body { background: #fff !important; padding: 20px !important; } 
                            .card { 
                                box-shadow: none !important; 
                                margin: 0 auto !important;
                                width: 550px !important; /* Slightly smaller for safe margins */
                            } 
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        ${logoHtml}
                        <div class="biz-name">${businessName || 'Business'}</div>
                        <div class="divider"></div>
                        <div class="cta-pill">
                            <img src="${GOOGLE_G_SVG}" alt="Google" />
                            <span>Scan to Leave Us a Google Review</span>
                        </div>
                        <div class="stars">
                            ${Array(5).fill('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>').join('')}
                        </div>
                        <div class="qr-frame"><img src="${qrDataUrl}" alt="QR" /></div>
                        <div class="url">${domain}/${businessSlug}</div>
                        <div class="powered">Powered by Zyene Reviews</div>
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
    };

    return (
        <div className="h-full rounded-[24px] bg-[#223122] p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative border border-[#3e4a3e]/30 shadow-sm min-h-[360px]">
            {/* Background decorative blob */}
            <svg className="absolute -right-8 -top-8 w-[280px] h-[280px] opacity-[0.03] text-white pointer-events-none" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.6,-46.3C91.4,-33.5,98,-18.1,97.7,-2.8C97.4,12.5,90.2,27.7,80.1,40.6C70,53.5,57.1,64.1,42.8,71.4C28.5,78.7,12.8,82.8,-1.9,86.1C-16.7,89.4,-30.3,91.9,-43.3,86.9C-56.3,81.9,-68.8,69.5,-78.1,55.1C-87.5,40.8,-93.8,24.6,-94.1,8.4C-94.4,-7.8,-88.7,-24,-79.3,-38C-69.8,-52,-56.7,-63.9,-42.6,-71C-28.5,-78.1,-13.4,-80.4,1.4,-82.9C16.3,-85.4,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>

            <div className="relative z-10">
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">
                    YOUR CUSTOMER PORTAL
                </p>
                <h2 className="text-[28px] font-serif text-white/95 leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>
                    Share it. Collect reviews.<br/>Drive repeat orders.
                </h2>
                <p className="text-[13px] text-white/60 leading-relaxed max-w-[90%] mb-6">
                    One link. Leave it on receipts, tables, or the door. We handle the rest.
                </p>
            </div>

            <div className="relative z-10 w-full space-y-3">
                {/* Link Box */}
                <div className="flex items-center justify-between bg-[#2f3d2f] rounded-[10px] p-1.5 pl-4 border border-white/5 hover:bg-[#384738] transition-colors cursor-pointer group" onClick={handleCopyLink}>
                    <div className="flex items-center gap-3 overflow-hidden text-white/80">
                        <Share2 className="w-4 h-4 text-white/40 shrink-0" />
                        <span className="text-[13px] truncate tracking-tight">{domain}/{businessSlug}</span>
                    </div>
                    <div className="bg-[#1a251a] group-hover:bg-[#1a251a]/80 text-white/90 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors flex items-center justify-center shrink-0">
                        {copied ? "Copied" : "Copy"}
                    </div>
                </div>

                {/* 4 Action Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <Dialog open={showQr} onOpenChange={setShowQr}>
                        <Button variant="ghost" onClick={() => setShowQr(true)} className="w-full bg-[#d65d45] hover:bg-[#c2513a] text-white hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]">
                            <QrCode className="w-3.5 h-3.5 mr-2" />
                            Show QR code
                        </Button>
                        <DialogContent className="sm:max-w-md p-8 border-none flex flex-col items-center">
                            <DialogTitle className="text-center font-serif text-2xl mb-4">Scan to Review</DialogTitle>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border mt-2 mb-6 min-h-[240px] flex items-center justify-center">
                                {loading ? (
                                    <div className="text-sm text-muted-foreground">Loading...</div>
                                ) : qrDataUrl ? (
                                    <img src={qrDataUrl} alt="QR Code" className="w-[240px] h-[240px]" style={{ imageRendering: 'pixelated' }} />
                                ) : (
                                    <div className="text-sm text-muted-foreground">Failed to load QR code</div>
                                )}
                            </div>
                            <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => setShowQr(false)}>Close</Button>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" onClick={handleShare} className="w-full bg-[#2f3d2f] hover:bg-[#384738] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]">
                        <Share2 className="w-3.5 h-3.5 mr-2 opacity-70" />
                        Share link
                    </Button>
                    <Button variant="ghost" onClick={handleDownload} disabled={!qrDataUrl} className="w-full bg-[#2f3d2f] hover:bg-[#384738] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]">
                        <Download className="w-3.5 h-3.5 mr-2 opacity-70" />
                        Download
                    </Button>
                    <Button variant="ghost" onClick={handlePrint} disabled={!qrDataUrl} className="w-full bg-[#2f3d2f] hover:bg-[#384738] text-white/80 hover:text-white border-0 h-10 rounded-[10px] font-medium text-[12px]">
                        <Printer className="w-3.5 h-3.5 mr-2 opacity-70" />
                        Print poster
                    </Button>
                </div>
            </div>
        </div>
    );
}

