"use client";

import { useState, useEffect } from "react";
import { Copy, Download, Printer, Share2, QrCode, Check, RefreshCw, ShoppingCart } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";

interface QRCodeCardProps {
    businessId: string;
    businessSlug: string;
    businessName: string;
    businessLogoUrl?: string | null;
    brandColor?: string | null;
}

/** Resolve a brand color: if truthy, use it; otherwise fall back to a refined dark default. */
function resolveBrandColor(color?: string | null): string {
    return color && /^#([0-9a-fA-F]{3}){1,2}$/.test(color) ? color : "#0f172a";
}

/** Compute a readable text color (white or dark) for a hex background. */
function contrastText(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Relative luminance (sRGB)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
}

function getDisplayDomain(): string {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    return rootDomain.includes("localhost") ? rootDomain : "www.collectratings.com";
}

export function QRCodeCard({ businessId, businessSlug, businessName, businessLogoUrl, brandColor }: QRCodeCardProps) {
    const { dict } = useLanguage();
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [reviewUrl, setReviewUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);
    // Branding from API (may override prop values if fresher)
    const [apiLogoUrl, setApiLogoUrl] = useState<string | null>(null);
    const [apiBrandColor, setApiBrandColor] = useState<string | null>(null);
    const [apiPageBg, setApiPageBg] = useState<string | null>(null);

    const logoUrl = apiLogoUrl ?? businessLogoUrl ?? null;
    const resolvedColor = resolveBrandColor(apiBrandColor ?? brandColor);
    const resolvedBgColor = apiPageBg ?? "#ffffff";

    const fetchQRCode = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/businesses/${businessId}/qr-code`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setQrDataUrl(data.qrCodeDataUrl);
            setReviewUrl(data.reviewUrl);
            if (data.logoUrl) setApiLogoUrl(data.logoUrl);
            if (data.brandColor) setApiBrandColor(data.brandColor);
            if (data.reviewPageBackgroundColor) setApiPageBg(data.reviewPageBackgroundColor);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQRCode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessId]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(reviewUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const GOOGLE_G_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTI0IDkuNWMzLjU0IDAgNi43MSAxLjIyIDkuMjEgMy42bDYuODUtNi44NUMzNS45IDIuMzggMzAuNDcgMCAyNCAwIDE0LjYyIDAgNi41MSA1LjM4IDIuNTYgMTMuMjJsNy45OCA2LjE5QzEyLjQzIDEzLjcyIDE3Ljc0IDkuNSAyNCA5LjV6Ii8+PHBhdGggZmlsbD0iIzQyODVGNCIgZD0iTTQ2Ljk4IDI0LjU1YzAtMS41Ny0uMTUtMy4wOS0uMzgtNC41NUgyNHY5LjAyaDEyLjk0Yy0uNTggMi45Ni0yLjI2IDUuNDgtNC43OCA3LjE4bDcuNzMgNmM0LjUxLTQuMTggNy4wOS0xMC4zNiA3LjA5LTE3LjY1eiIvPjxwYXRoIGZpbGw9IiNGQkJDMDUiIGQ9Ik0xMC41MyAyOC41OWMtLjQ4LTEuNDUtLjc2LTIuOTktLjc2LTQuNTlzLjI3LTMuMTQuNzYtNC41OWwtNy45OC02LjE5Qy45MiAxNi40NiAwIDIwLjEyIDAgMjRjMCAzLjg4LjkyIDcuNTQgMi41NiAxMC43OGw3Ljk3LTYuMTl6Ii8+PHBhdGggZmlsbD0iIzM0QTg1MyIgZD0iTTI0IDQ4YzYuNDggMCAxMS45My0yLjEzIDE1Ljg5LTUuODFsLTcuNzMtNmMtMi4xNSAxLjQ1LTQuOTIgMi4zLTguMTYgMi4zLTYuMjYgMC0xMS41Ny00LjIyLTEzLjQ3LTkuOTFsLTcuOTggNi4xOUM2LjUxIDQyLjYyIDE0LjYyIDQ4IDI0IDQ4eiIvPjwvc3ZnPg==";

    /* ───────── Branded Download (Canvas) ───────── */
    const handleDownload = () => {
        if (!qrDataUrl) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = 600;

        const accent = resolvedColor;
        const accentFg = contrastText(accent);
        const rootDomain = getDisplayDomain();

        // Helper to draw rounded rect
        const roundRect = (x: number, y: number, w: number, h: number, r: number | number[]) => {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
        };

        const drawCard = (logo: HTMLImageElement | null, googleIcon: HTMLImageElement) => {
            // Compute dynamic height
            let H = 50; // top padding
            let lh = 0;
            let lw = 0;
            if (logo) {
                const maxLogoH = 64;
                const maxLogoW = 200;
                const scale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height, 1);
                lw = logo.width * scale;
                lh = logo.height * scale;
                H += 10 + lh + 16;
            } else {
                H += 20;
            }
            H += 80; // Business Name
            H += 20; // Divider
            H += 108; // CTA pill + 5 stars
            H += 328; // QR Code (24 pad + 300 size + 28 margin but actually 300)
            H += 36; // URL
            H += 30; // Powered by 
            H += 30; // Bottom padding

            canvas.width = W;
            canvas.height = H;

            // — Outer card with subtle shadow illusion
            roundRect(0, 0, W, H, 24);
            ctx.fillStyle = resolvedBgColor;
            ctx.fill();

            // — Top accent strip
            ctx.save();
            roundRect(0, 0, W, 10, [24, 24, 0, 0]);
            ctx.clip();
            ctx.fillStyle = accent;
            ctx.fillRect(0, 0, W, 10);
            ctx.restore();

            // — Bottom accent strip
            ctx.save();
            roundRect(0, H - 10, W, 10, [0, 0, 24, 24]);
            ctx.clip();
            ctx.fillStyle = accent;
            ctx.fillRect(0, H - 10, W, 10);
            ctx.restore();

            // — Inner border
            roundRect(20, 20, W - 40, H - 40, 16);
            ctx.strokeStyle = resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.3)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            let cursorY = 50;

            // — Logo (if available)
            if (logo) {
                const lx = (W - lw) / 2;
                cursorY += 10;
                ctx.drawImage(logo, lx, cursorY, lw, lh);
                cursorY += lh + 16;
            } else {
                cursorY += 20;
            }

            // — Business name
            ctx.fillStyle = contrastText(resolvedBgColor);
            ctx.font = "bold 32px 'Inter', 'Segoe UI', system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(businessName, W / 2, cursorY + 32);
            cursorY += 52;

            // — Divider line
            ctx.strokeStyle = resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, cursorY);
            ctx.lineTo(W - 60, cursorY);
            ctx.stroke();
            cursorY += 20;

            // — CTA pill (with Google Icon)
            const ctaText = "Scan to Leave Us a Google Review";
            ctx.font = "600 16px 'Inter', 'Segoe UI', system-ui, sans-serif";
            const ctaMetrics = ctx.measureText(ctaText);
            const iconSize = 24;
            const gap = 10;
            const innerW = iconSize + gap + ctaMetrics.width;
            const pillW = innerW + 56;
            const pillH = 48;
            const pillX = (W - pillW) / 2;
            roundRect(pillX, cursorY, pillW, pillH, pillH / 2);
            ctx.fillStyle = accent;
            ctx.fill();

            // Draw Google Icon
            const iconX = pillX + 28;
            const iconY = cursorY + (pillH - iconSize) / 2;
            ctx.drawImage(googleIcon, iconX, iconY, iconSize, iconSize);

            // Draw text
            ctx.fillStyle = accentFg;
            ctx.textAlign = "left";
            ctx.fillText(ctaText, iconX + iconSize + gap, cursorY + 30);
            cursorY += pillH + 16; // Add space before stars

            // Draw 5 stars
            const drawStar = (cx: number, cy: number, spikes = 5, outerRadius = 11, innerRadius = 5) => {
                let rot = Math.PI / 2 * 3;
                let x = cx;
                let y = cy;
                const step = Math.PI / spikes;

                ctx.beginPath();
                ctx.moveTo(cx, cy - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    x = cx + Math.cos(rot) * outerRadius;
                    y = cy + Math.sin(rot) * outerRadius;
                    ctx.lineTo(x, y);
                    rot += step;

                    x = cx + Math.cos(rot) * innerRadius;
                    y = cy + Math.sin(rot) * innerRadius;
                    ctx.lineTo(x, y);
                    rot += step;
                }
                ctx.lineTo(cx, cy - outerRadius);
                ctx.closePath();
                ctx.fillStyle = "#FFC107";
                ctx.fill();
            };

            const starSpacing = 30;
            const starStartX = (W - (4 * starSpacing)) / 2;
            for (let i = 0; i < 5; i++) {
                drawStar(starStartX + (i * starSpacing), cursorY + 11);
            }
            cursorY += 24 + 18; // Advance cursor past stars before QR

            // — QR Code
            const qrImg = new Image();
            qrImg.onload = () => {
                const qrSize = 300;
                const qrX = (W - qrSize) / 2;

                // QR container with rounded border (always white so code is scannable)
                roundRect(qrX - 12, cursorY - 12, qrSize + 24, qrSize + 24, 16);
                ctx.strokeStyle = resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.3)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.fill();

                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(qrImg, qrX, cursorY, qrSize, qrSize);
                cursorY += qrSize + 36;

                // — URL text
                ctx.fillStyle = resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#888888" : "rgba(255,255,255,0.85)";
                ctx.font = "500 16px 'Inter', 'Segoe UI', system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`${rootDomain}/${businessSlug}`, W / 2, cursorY);
                cursorY += 32;

                // — Powered by
                ctx.fillStyle = resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#aaaaaa" : "rgba(255,255,255,0.6)";
                ctx.font = "bold 15px 'Inter', 'Segoe UI', system-ui, sans-serif";
                ctx.fillText("Powered by Zyene Reviews", W / 2, cursorY);

                // — Trigger download
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `${businessSlug}-qr-poster.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("QR code downloaded!");
            };
            qrImg.src = qrDataUrl;
        };

        // Load images
        const googleImg = new Image();
        googleImg.crossOrigin = "anonymous";
        googleImg.onload = () => {
            if (logoUrl) {
                const logoImg = new Image();
                logoImg.crossOrigin = "anonymous";
                logoImg.onload = () => drawCard(logoImg, googleImg);
                logoImg.onerror = () => drawCard(null, googleImg);
                logoImg.src = logoUrl;
            } else {
                drawCard(null, googleImg);
            }
        };
        googleImg.src = GOOGLE_G_SVG;
    };

    /* ───────── Branded Print (HTML popup) ───────── */
    const handlePrint = () => {
        const printWindow = window.open("", "_blank", "width=500,height=700");
        if (!printWindow) {
            toast.error("Please allow popups to print.");
            return;
        }

        const accent = resolvedColor;
        const accentFg = contrastText(accent);
        const rootDomain = getDisplayDomain();

        const logoHtml = logoUrl
            ? `<img src="${logoUrl}" alt="${businessName}" class="logo" crossorigin="anonymous" />`
            : "";

        printWindow.document.write(
            `
            <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            background: #f5f5f5;
                            padding: 24px;
                        }
                        .card {
                            background: ${resolvedBgColor};
                            border-radius: 24px;
                            overflow: hidden;
                            max-width: 420px;
                            width: 100%;
                            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                        }
                        .accent-top {
                            height: 8px;
                            background: ${accent};
                        }
                        .accent-bottom {
                            height: 8px;
                            background: ${accent};
                        }
                        .inner {
                            padding: 36px 32px 28px;
                            text-align: center;
                        }
                        .logo {
                            max-height: 56px;
                            max-width: 180px;
                            object-fit: contain;
                            margin-bottom: 16px;
                        }
                        .biz-name {
                            font-size: 24px;
                            font-weight: 700;
                            color: ${contrastText(resolvedBgColor)};
                            margin-bottom: 16px;
                        }
                        .divider {
                            height: 1px;
                            background: ${resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.2)"};
                            margin: 0 20px 20px;
                        }
                        .cta-pill {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                            padding: 10px 28px;
                            border-radius: 999px;
                            background: ${accent};
                            color: ${accentFg};
                            font-weight: 600;
                            font-size: 15px;
                            margin-bottom: 24px;
                        }
                        .cta-pill img {
                            width: 22px;
                            height: 22px;
                        }
                        .stars {
                            display: flex;
                            justify-content: center;
                            gap: 10px;
                            margin-bottom: 24px;
                        }
                        .stars svg {
                            width: 24px;
                            height: 24px;
                        }
                        .qr-frame {
                            display: inline-block;
                            border: 1.5px solid ${resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#e5e5e5" : "rgba(255,255,255,0.3)"};
                            border-radius: 16px;
                            background: #ffffff;
                            padding: 12px;
                            margin-bottom: 20px;
                        }
                        .qr-frame img {
                            width: 260px;
                            height: 260px;
                            image-rendering: pixelated;
                            display: block;
                        }
                        .url {
                            color: ${resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#888" : "rgba(255,255,255,0.7)"};
                            font-size: 13px;
                            margin-bottom: 20px;
                        }
                        .powered {
                            font-weight: 700;
                            font-size: 11px;
                            color: ${resolvedBgColor === "#ffffff" || resolvedBgColor === "#f5f5f5" ? "#aaa" : "rgba(255,255,255,0.5)"};
                            margin-bottom: 8px;
                        }
                        @page {
                            margin: 0;
                        }
                        @media print {
                            body { 
                                background: #ffffff; 
                                padding: 1.5cm; 
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            .card { 
                                box-shadow: none; 
                                max-width: 100%; 
                                border: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="accent-top"></div>
                        <div class="inner">
                            ${logoHtml}
                            <div class="biz-name">${businessName}</div>
                            <div class="divider"></div>
                            <div class="cta-pill">
                                <img src="${GOOGLE_G_SVG}" alt="Google" />
                                <span>Scan to Leave Us a Google Review</span>
                            </div>
                            <div class="stars">
                                ${Array(5).fill('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFC107"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>').join('')}
                            </div>
                            <div class="qr-frame">
                                <img src="${qrDataUrl}" alt="QR Code" />
                            </div>
                            <div class="url">${rootDomain}/${businessSlug}</div>
                            <div class="powered">Powered by Zyene Reviews</div>
                        </div>
                        <div class="accent-bottom"></div>
                    </div>
                </body>
            </html>
            `
        );
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 400);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${businessName} — Leave a Review`,
                    url: reviewUrl,
                });
            } catch {
                // User cancelled share
            }
        } else {
            handleCopyLink();
        }
    };

    const secondaryActionClass =
        "h-10 w-full justify-start rounded-xl border border-border/70 bg-white/80 px-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-[#201515]/20 hover:bg-white hover:shadow-md dark:border-border dark:bg-card/80 dark:hover:bg-card";

    const primaryActionClass =
        "h-10 w-full justify-start rounded-xl bg-[#201515] px-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#201515] hover:shadow-md";

    return (
        <Card className="mt-2 overflow-hidden border border-border/60 bg-[#f9f7f3] dark:bg-[#1f1d1a]">
            <CardContent className="p-0 flex min-w-0 flex-col md:flex-row">
                {/* Left Section: Text Content */}
                <div className="flex min-w-0 flex-1 flex-col justify-center p-6 md:py-10 md:pl-16 md:pr-8 lg:pl-24">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0 text-muted-foreground">
                            <QrCode className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                                {businessName}
                            </h2>
                            <h3 className="text-xl font-medium text-foreground mb-4">
                                {dict.qr.portal}
                            </h3>
                            <p className="text-muted-foreground text-base max-w-md mb-6 leading-relaxed">
                                {dict.qr.description}
                            </p>
                            
                            <div 
                                onClick={handleCopyLink}
                                className="flex max-w-full items-center text-sm font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            >
                                <span
                                    className="truncate"
                                    title={`${getDisplayDomain()}/${businessSlug}`}
                                >
                                    {getDisplayDomain()}/{businessSlug}
                                </span>
                                {copied ? <Check className="w-4 h-4 ml-2 text-green-500" /> : <Copy className="w-4 h-4 ml-2" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Action Buttons */}
                <div className="w-full px-6 py-6 flex flex-col justify-center gap-3 border-t border-border/60 md:w-auto md:border-t-0 md:border-r md:min-w-[180px] md:py-8 md:pr-8 lg:pr-12">
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={!qrDataUrl} className={secondaryActionClass}>
                        <Download className="h-3.5 w-3.5 mr-2" />
                        {dict.qr.download}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint} disabled={!qrDataUrl} className={secondaryActionClass}>
                        <Printer className="h-3.5 w-3.5 mr-2" />
                        {dict.qr.print}
                    </Button>
                    <Button variant="default" size="sm" onClick={() => toast.info("Order QR coming soon!")} className={primaryActionClass}>
                        <QrCode className="h-3.5 w-3.5 mr-2" />
                        {dict.qr.order}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className={secondaryActionClass}>
                        <Share2 className="h-3.5 w-3.5 mr-2" />
                        {dict.qr.share}
                    </Button>
                </div>

                {/* Right Section: Big QR Code */}
                <div className="flex w-full flex-col items-center justify-center border-t border-border/60 bg-[#f9f7f3] p-6 dark:bg-[#1f1d1a] md:w-auto md:min-w-[280px] md:border-t-0 md:py-10 md:pl-8 md:pr-16 lg:pl-12 lg:pr-24">
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="group cursor-pointer flex flex-col items-center justify-center">
                                <div className="mb-6 flex h-[228px] w-[228px] items-center justify-center rounded-[2rem] border-[4px] border-border bg-card p-6 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/25 dark:bg-[#26221d]">
                                    <QrCode className="h-[140px] w-[140px] text-foreground" strokeWidth={1} />
                                </div>
                                <p className="text-[13px] text-foreground font-medium text-center group-hover:text-primary transition-colors">
                                    {dict.qr.tap_icon}
                                </p>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-8 border-none">
                            <DialogTitle className="sr-only">QR Code for {businessName}</DialogTitle>
                            <div className="flex flex-col items-center mb-2">
                                <h2 className="text-2xl font-bold text-foreground text-center mb-2">
                                    {businessName} {dict.qr.review_page}
                                </h2>
                                <div 
                                    onClick={handleCopyLink}
                                    className="flex max-w-full items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors mx-auto"
                                >
                                    <span
                                        className="truncate"
                                        title={`${getDisplayDomain()}/${businessSlug}`}
                                    >
                                        {getDisplayDomain()}/{businessSlug}
                                    </span>
                                    {copied ? <Check className="w-3.5 h-3.5 ml-1.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 ml-1.5" />}
                                </div>
                            </div>
                            
                            <div className="flex justify-center my-6">
                                {loading ? (
                                    <Skeleton className="h-[220px] w-[220px] rounded-xl" />
                                ) : error ? (
                                    <div className="h-[220px] w-[220px] flex flex-col items-center justify-center gap-3 bg-muted rounded-xl border border-dashed">
                                        <p className="text-sm text-muted-foreground">Couldn't load QR code.</p>
                                    </div>
                                ) : (
                                    <img
                                        src={qrDataUrl!}
                                        alt={`QR code for ${businessName}`}
                                        className="h-[220px] w-[220px]"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <Button variant="outline" onClick={handleDownload} disabled={!qrDataUrl} className="h-10 w-full rounded-xl border border-border/70 bg-white/80 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-[#201515]/20 hover:bg-white hover:shadow-md dark:border-border dark:bg-card/80 dark:hover:bg-card">
                                    <Download className="h-4 w-4 mr-2" />
                                    {dict.qr.download_short}
                                </Button>
                                <Button variant="outline" onClick={handleShare} className="h-10 w-full rounded-xl border border-border/70 bg-white/80 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-[#201515]/20 hover:bg-white hover:shadow-md dark:border-border dark:bg-card/80 dark:hover:bg-card">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    {dict.qr.share_link}
                                </Button>
                                <Button variant="outline" onClick={handlePrint} disabled={!qrDataUrl} className="h-10 w-full rounded-xl border border-border/70 bg-white/80 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-[#201515]/20 hover:bg-white hover:shadow-md dark:border-border dark:bg-card/80 dark:hover:bg-card">
                                    <Printer className="h-4 w-4 mr-2" />
                                    {dict.qr.print_short}
                                </Button>
                                <Button onClick={() => toast.info("Order QR coming soon!")} className="h-10 w-full rounded-xl bg-[#201515] text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#201515] hover:shadow-md">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    {dict.qr.order_now}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
