"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function usePublicProfileEditorQrShare(
    businessId: string,
    businessName: string,
    initialSlug: string,
    previewUrl: string,
) {
    const [copied, setCopied] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    const fullUrl = `https://${previewUrl}`;

    useEffect(() => {
        setQrDataUrl(null);
    }, [initialSlug]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: `${businessName} — Leave a Review`, url: fullUrl });
                return;
            } catch {
                /* user cancelled */
            }
        }
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    const fetchQrCode = useCallback(async () => {
        setQrLoading(true);
        try {
            const res = await fetch(`/api/businesses/${businessId}/qr-code`, {
                credentials: "include",
            });
            const data = (await res.json().catch(() => ({}))) as {
                qrCodeDataUrl?: string;
                error?: string;
            };
            if (!res.ok || !data.qrCodeDataUrl) {
                throw new Error(typeof data.error === "string" ? data.error : "Failed to load QR code");
            }
            setQrDataUrl(data.qrCodeDataUrl);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to load QR code");
        } finally {
            setQrLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        if (qrDialogOpen && !qrDataUrl) void fetchQrCode();
    }, [qrDialogOpen, qrDataUrl, fetchQrCode]);

    const handleDownloadQr = (slugForFilename: string) => {
        if (!qrDataUrl) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = 500;
        const height = 650;
        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, 16);
        ctx.fill();

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(20, 20, width - 40, height - 40, 16);
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Leave a Review", width / 2, 90);

        const qrImg = new Image();
        qrImg.onload = () => {
            const qrSize = 300;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(qrImg, (width - qrSize) / 2, 120, qrSize, qrSize);

            ctx.fillStyle = "#666666";
            ctx.font = "14px sans-serif";
            ctx.fillText(previewUrl, width / 2, 470);

            ctx.fillStyle = "#999999";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText("Powered by Zyene", width / 2, 520);

            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${slugForFilename || initialSlug || "review"}-qr-code.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("QR code downloaded!");
        };
        qrImg.src = qrDataUrl;
    };

    const handlePrintQr = () => {
        if (!qrDataUrl) return;
        const printWindow = window.open("", "_blank", "width=400,height=600");
        if (!printWindow) {
            toast.error("Please allow popups to print.");
            return;
        }
        printWindow.document.write(
            `<html><head><style>body{font-family:sans-serif;text-align:center;padding:40px}.container{border:2px solid #000;padding:40px;display:inline-block;border-radius:16px}h1{margin-bottom:20px}img{width:300px;height:300px;image-rendering:pixelated}.url{margin-top:20px;color:#666;font-size:14px}.logo{font-weight:bold;margin-top:30px;font-size:12px;color:#999}</style></head><body><div class="container"><h1>Leave a Review</h1><img src="${qrDataUrl}"/><p class="url">${previewUrl}</p><p class="logo">Powered by Zyene</p></div></body></html>`,
        );
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    };

    return {
        copied,
        qrDialogOpen,
        setQrDialogOpen,
        qrDataUrl,
        qrLoading,
        handleShare,
        handleDownloadQr,
        handlePrintQr,
    };
}
