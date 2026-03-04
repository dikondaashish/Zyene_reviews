"use client";

import { useState, useEffect } from "react";
import { Copy, Download, Printer, Share2, QrCode, Check, RefreshCw } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface QRCodeCardProps {
    businessId: string;
    businessSlug: string;
    businessName: string;
}

export function QRCodeCard({ businessId, businessSlug, businessName }: QRCodeCardProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [reviewUrl, setReviewUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchQRCode = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/businesses/${businessId}/qr-code`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setQrDataUrl(data.qrCodeDataUrl);
            setReviewUrl(data.reviewUrl);
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

    const handleDownload = () => {
        if (!qrDataUrl) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = 500;
        const height = 650;
        canvas.width = width;
        canvas.height = height;

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, 16);
        ctx.fill();

        // Border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(20, 20, width - 40, height - 40, 16);
        ctx.stroke();

        // Title: "Review Us on Google"
        ctx.fillStyle = "#000000";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Review Us on Google", width / 2, 90);

        // QR Code image
        const qrImg = new Image();
        qrImg.onload = () => {
            const qrSize = 300;
            const qrX = (width - qrSize) / 2;
            const qrY = 120;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // URL text
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com";
            ctx.fillStyle = "#666666";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${rootDomain}/${businessSlug}`, width / 2, 470);

            // "Powered by Zyene"
            ctx.fillStyle = "#999999";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText("Powered by Zyene", width / 2, 520);

            // Download
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

    const handlePrint = () => {
        const printWindow = window.open("", "_blank", "width=400,height=600");
        if (!printWindow) {
            toast.error("Please allow popups to print.");
            return;
        }
        printWindow.document.write(
            `
            <html>
                <head>
                    <style>
                        body {
                            font-family: sans-serif;
                            text-align: center;
                            padding: 40px;
                        }
                        .container {
                            border: 2px solid #000;
                            padding: 40px;
                            display: inline-block;
                            border-radius: 16px;
                        }
                        h1 { margin-bottom: 20px; }
                        img {
                            width: 300px;
                            height: 300px;
                            image-rendering: pixelated;
                        }
                        .url {
                            margin-top: 20px;
                            color: #666;
                            font-size: 14px;
                        }
                        .logo {
                            font-weight: bold;
                            margin-top: 30px;
                            font-size: 12px;
                            color: #999;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Review Us on Google</h1>
                        <img src="${qrDataUrl}" />
                        <p class="url">${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${businessSlug}</p>
                        <p class="logo">Powered by Zyene</p>
                    </div>
                </body>
            </html>
            `
        );
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 300);
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

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Your Review Page</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-2">
                    <span className="font-mono text-xs truncate">{process.env.NEXT_PUBLIC_ROOT_DOMAIN}/{businessSlug}</span>
                    <button
                        onClick={handleCopyLink}
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        aria-label="Copy link"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </button>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                    {loading ? (
                        <Skeleton className="h-[200px] w-[200px] rounded-lg" />
                    ) : error ? (
                        <div className="h-[200px] w-[200px] flex flex-col items-center justify-center gap-3 bg-slate-50 rounded-lg border border-dashed">
                            <p className="text-sm text-muted-foreground">Couldn&apos;t generate QR code.</p>
                            <Button variant="outline" size="sm" onClick={fetchQRCode}>
                                <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                        </div>
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={qrDataUrl!}
                            alt={`QR code for ${businessName}`}
                            className="h-[200px] w-[200px] rounded-lg"
                        />
                    )}
                </div>

                {/* Action Buttons */}
                {!loading && !error && (
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs" disabled={!qrDataUrl}>
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs" disabled={!qrDataUrl}>
                            <Printer className="h-3.5 w-3.5 mr-1" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
                            <Share2 className="h-3.5 w-3.5 mr-1" />
                            Share
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
