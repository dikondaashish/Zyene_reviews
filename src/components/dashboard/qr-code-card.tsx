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

    const logoUrl = apiLogoUrl ?? businessLogoUrl ?? null;
    const resolvedColor = resolveBrandColor(apiBrandColor ?? brandColor);

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

    /* ───────── Branded Download (Canvas) ───────── */
    const handleDownload = () => {
        if (!qrDataUrl) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = 600;
        const H = 820;
        canvas.width = W;
        canvas.height = H;

        const accent = resolvedColor;
        const accentFg = contrastText(accent);
        const rootDomain = getDisplayDomain();

        // Helper to draw rounded rect
        const roundRect = (x: number, y: number, w: number, h: number, r: number | number[]) => {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
        };

        const drawCard = (logo: HTMLImageElement | null) => {
            // — Outer card with subtle shadow illusion
            roundRect(0, 0, W, H, 24);
            ctx.fillStyle = "#ffffff";
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
            ctx.strokeStyle = "#e5e5e5";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            let cursorY = 50;

            // — Logo (if available)
            if (logo) {
                const maxLogoH = 64;
                const maxLogoW = 200;
                const scale = Math.min(maxLogoW / logo.width, maxLogoH / logo.height, 1);
                const lw = logo.width * scale;
                const lh = logo.height * scale;
                const lx = (W - lw) / 2;
                cursorY += 10;
                ctx.drawImage(logo, lx, cursorY, lw, lh);
                cursorY += lh + 16;
            } else {
                cursorY += 20;
            }

            // — Business name
            ctx.fillStyle = "#111111";
            ctx.font = "bold 28px 'Inter', 'Segoe UI', system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(businessName, W / 2, cursorY + 28);
            cursorY += 52;

            // — Divider line
            ctx.strokeStyle = "#e5e5e5";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(60, cursorY);
            ctx.lineTo(W - 60, cursorY);
            ctx.stroke();
            cursorY += 20;

            // — CTA pill
            const ctaText = "Scan to Leave Us a Review";
            ctx.font = "600 16px 'Inter', 'Segoe UI', system-ui, sans-serif";
            const ctaMetrics = ctx.measureText(ctaText);
            const pillW = ctaMetrics.width + 40;
            const pillH = 36;
            const pillX = (W - pillW) / 2;
            roundRect(pillX, cursorY, pillW, pillH, pillH / 2);
            ctx.fillStyle = accent;
            ctx.fill();
            ctx.fillStyle = accentFg;
            ctx.textAlign = "center";
            ctx.fillText(ctaText, W / 2, cursorY + 24);
            cursorY += pillH + 24;

            // — QR Code
            const qrImg = new Image();
            qrImg.onload = () => {
                const qrSize = 300;
                const qrX = (W - qrSize) / 2;

                // QR container with rounded border
                roundRect(qrX - 12, cursorY - 12, qrSize + 24, qrSize + 24, 16);
                ctx.strokeStyle = "#e5e5e5";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = "#ffffff";
                ctx.fill();

                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(qrImg, qrX, cursorY, qrSize, qrSize);
                cursorY += qrSize + 28;

                // — URL text
                ctx.fillStyle = "#888888";
                ctx.font = "14px 'Inter', 'Segoe UI', system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`${rootDomain}/${businessSlug}`, W / 2, cursorY);
                cursorY += 30;

                // — Powered by Zyene
                ctx.fillStyle = "#aaaaaa";
                ctx.font = "bold 11px 'Inter', 'Segoe UI', system-ui, sans-serif";
                ctx.fillText("Powered by Zyene", W / 2, cursorY);

                // — Trigger download
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `${businessSlug}-qr-code.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("QR code downloaded!");
            };
            qrImg.src = qrDataUrl;
        };

        // Load logo first (if available), then draw
        if (logoUrl) {
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            logoImg.onload = () => drawCard(logoImg);
            logoImg.onerror = () => drawCard(null); // Fallback: render without logo
            logoImg.src = logoUrl;
        } else {
            drawCard(null);
        }
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
                            background: #ffffff;
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
                            color: #111;
                            margin-bottom: 16px;
                        }
                        .divider {
                            height: 1px;
                            background: #e5e5e5;
                            margin: 0 20px 20px;
                        }
                        .cta-pill {
                            display: inline-block;
                            padding: 8px 24px;
                            border-radius: 999px;
                            background: ${accent};
                            color: ${accentFg};
                            font-weight: 600;
                            font-size: 14px;
                            margin-bottom: 24px;
                        }
                        .qr-frame {
                            display: inline-block;
                            border: 1.5px solid #e5e5e5;
                            border-radius: 16px;
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
                            color: #888;
                            font-size: 13px;
                            margin-bottom: 20px;
                        }
                        .powered {
                            font-weight: 700;
                            font-size: 11px;
                            color: #aaa;
                            margin-bottom: 8px;
                        }
                        @media print {
                            body { background: #fff; padding: 0; }
                            .card { box-shadow: none; max-width: 100%; }
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
                            <div class="cta-pill">Scan to Leave Us a Review</div>
                            <div class="qr-frame">
                                <img src="${qrDataUrl}" alt="QR Code" />
                            </div>
                            <div class="url">${rootDomain}/${businessSlug}</div>
                            <div class="powered">Powered by Zyene</div>
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
