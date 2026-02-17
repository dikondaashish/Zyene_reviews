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
        const link = document.createElement("a");
        link.href = qrDataUrl;
        link.download = `${businessSlug}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR code downloaded!");
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank", "width=400,height=600");
        if (!printWindow) {
            toast.error("Please allow popups to print.");
            return;
        }
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code — ${businessName}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        padding: 40px;
                        text-align: center;
                    }
                    h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
                    p.tagline { font-size: 18px; color: #475569; margin-bottom: 32px; }
                    img { width: 280px; height: 280px; margin-bottom: 16px; }
                    p.url { font-size: 14px; color: #64748b; margin-bottom: 40px; }
                    p.footer { font-size: 11px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <h1>${businessName}</h1>
                <p class="tagline">Scan to leave us a review!</p>
                <img src="${qrDataUrl}" alt="QR Code" />
                <p class="url">zyene.in/r/${businessSlug}</p>
                <p class="footer">Powered by Zyene</p>
            </body>
            </html>
        `);
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
                    <span className="font-mono text-xs truncate">zyene.in/r/{businessSlug}</span>
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
                        <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
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
