"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguage } from "@/lib/language-context";
import { resolveBrandColor } from "@/components/dashboard/qr-code-helpers";
import { useQrCodeData } from "@/components/dashboard/use-qr-code-data";
import { downloadBrandedQrPoster } from "@/components/dashboard/qr-code-branded-download";
import { openBrandedQrPrintWindow } from "@/components/dashboard/qr-code-branded-print";
import { QrCodeCardInfoPanel } from "@/components/dashboard/qr-code-card-info-panel";
import { QrCodeCardActionColumn } from "@/components/dashboard/qr-code-card-action-column";
import { QrCodeCardQrPreviewColumn } from "@/components/dashboard/qr-code-card-qr-preview-column";

interface QRCodeCardProps {
    businessId: string;
    businessSlug: string;
    businessName: string;
    businessLogoUrl?: string | null;
    brandColor?: string | null;
}

export function QRCodeCard({ businessId, businessSlug, businessName, businessLogoUrl, brandColor }: QRCodeCardProps) {
    const { dict } = useLanguage();
    const [copied, setCopied] = useState(false);
    const { qrDataUrl, reviewUrl, loading, error, apiLogoUrl, apiBrandColor, apiPageBg } = useQrCodeData(businessId);

    const logoUrl = apiLogoUrl ?? businessLogoUrl ?? null;
    const resolvedColor = resolveBrandColor(apiBrandColor ?? brandColor);
    const resolvedBgColor = apiPageBg ?? "#ffffff";

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
        downloadBrandedQrPoster({
            qrDataUrl,
            businessName,
            businessSlug,
            brandColor: resolvedColor,
            pageBgColor: resolvedBgColor,
            logoUrl,
        });
    };

    const handlePrint = () => {
        if (!qrDataUrl) return;
        openBrandedQrPrintWindow({
            businessName,
            businessSlug,
            brandColor: resolvedColor,
            pageBgColor: resolvedBgColor,
            logoUrl,
            qrDataUrl,
        });
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
            void handleCopyLink();
        }
    };

    return (
        <Card className="mt-2 overflow-hidden border border-border/60 bg-canvas-elevated">
            <CardContent className="p-0 flex min-w-0 flex-col md:flex-row">
                <QrCodeCardInfoPanel
                    businessName={businessName}
                    portalTitle={dict.qr.portal}
                    description={dict.qr.description}
                    businessSlug={businessSlug}
                    copied={copied}
                    onCopyLink={() => void handleCopyLink()}
                />
                <QrCodeCardActionColumn
                    dictDownload={dict.qr.download}
                    dictPrint={dict.qr.print}
                    dictOrder={dict.qr.order}
                    dictShare={dict.qr.share}
                    onDownload={handleDownload}
                    onPrint={handlePrint}
                    onShare={() => void handleShare()}
                    qrReady={Boolean(qrDataUrl)}
                />
                <QrCodeCardQrPreviewColumn
                    businessName={businessName}
                    businessSlug={businessSlug}
                    dictTapIcon={dict.qr.tap_icon}
                    dictReviewPage={dict.qr.review_page}
                    dictDownloadShort={dict.qr.download_short}
                    dictShareLink={dict.qr.share_link}
                    dictPrintShort={dict.qr.print_short}
                    dictOrderNow={dict.qr.order_now}
                    loading={loading}
                    error={error}
                    qrDataUrl={qrDataUrl}
                    copied={copied}
                    onCopyLink={() => void handleCopyLink()}
                    onDownload={handleDownload}
                    onPrint={handlePrint}
                    onShare={() => void handleShare()}
                />
            </CardContent>
        </Card>
    );
}
