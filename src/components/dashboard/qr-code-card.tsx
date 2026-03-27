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
        <Card className="overflow-hidden bg-white shadow-sm border-slate-200/60 border mt-2">
            <CardContent className="p-0 flex flex-col md:flex-row">
                {/* Left Section: Text Content */}
                <div className="flex-1 p-6 md:py-10 md:pl-16 lg:pl-24 md:pr-8 flex flex-col justify-center">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0 text-slate-400">
                            <QrCode className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                                {businessName}
                            </h2>
                            <h3 className="text-xl font-medium text-slate-900 mb-4">
                                Your Review & Order Portal
                            </h3>
                            <p className="text-slate-600 text-base max-w-md mb-6 leading-relaxed">
                                Share this with customers to collect reviews and drive orders.
                            </p>
                            
                            <div 
                                onClick={handleCopyLink}
                                className="flex items-center text-sm font-mono text-slate-500 hover:text-slate-900 cursor-pointer transition-colors w-fit" 
                            >
                                {process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com"}/{businessSlug}
                                {copied ? <Check className="w-4 h-4 ml-2 text-green-500" /> : <Copy className="w-4 h-4 ml-2" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Action Buttons */}
                <div className="px-6 py-8 flex flex-col justify-center gap-3 md:border-r border-slate-200/60 min-w-[180px] md:pr-8 lg:pr-12">
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={!qrDataUrl} className="w-full justify-center text-xs font-medium h-9 rounded-md bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-none">
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint} disabled={!qrDataUrl} className="w-full justify-center text-xs font-medium h-9 rounded-md bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-none">
                        <Printer className="h-3.5 w-3.5 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Order QR coming soon!")} className="w-full justify-center text-xs font-medium h-9 rounded-md bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-none">
                        <QrCode className="h-3.5 w-3.5 mr-2" />
                        order QR now
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className="w-full justify-center text-xs font-medium h-9 rounded-md bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-none">
                        <Share2 className="h-3.5 w-3.5 mr-2" />
                        Share
                    </Button>
                </div>

                {/* Right Section: Big QR Code */}
                <div className="p-6 md:py-10 md:pl-8 lg:pl-12 md:pr-16 lg:pr-24 flex flex-col items-center justify-center min-w-[280px] bg-white">
                    <div className="bg-white p-6 rounded-[2rem] border-[4px] border-slate-100 shadow-sm flex items-center justify-center mb-6 transition-transform hover:scale-105 duration-300">
                        {loading ? (
                            <Skeleton className="h-[180px] w-[180px] rounded-xl" />
                        ) : error ? (
                            <div className="h-[180px] w-[180px] flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-slate-400">
                                <p className="text-xs">Error generating QR</p>
                                <Button variant="outline" size="sm" onClick={fetchQRCode} className="h-7 text-xs">
                                    <RefreshCw className="h-3 w-3 mr-1" /> Retry
                                </Button>
                            </div>
                        ) : (
                            <img
                                src={qrDataUrl!}
                                alt={`QR code for ${businessName}`}
                                className="h-[180px] w-[180px]"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        )}
                    </div>
                    <p className="text-[13px] text-slate-900 font-medium text-center">
                        Tap this icon to see your QR code
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
