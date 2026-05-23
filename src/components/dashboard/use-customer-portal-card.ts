"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CUSTOMER_PORTAL_DOMAIN } from "@/components/dashboard/customer-portal-card-constants";
import {
    contrastTextForHexBackground,
    resolveCustomerPortalBrandColor,
} from "@/components/dashboard/customer-portal-card-colors";
import { runBrandedQrPosterDownload } from "@/components/dashboard/customer-portal-card-branded-download";
import { openCustomerPortalPrintWindow } from "@/components/dashboard/customer-portal-card-print-html";
import type { CustomerPortalCardProps } from "@/components/dashboard/customer-portal-card-types";

export function useCustomerPortalCard({
    businessId,
    businessSlug,
    businessName,
    businessLogoUrl,
    brandColor,
    reviewPageBackgroundColor,
}: CustomerPortalCardProps) {
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const domain = CUSTOMER_PORTAL_DOMAIN;
    const portalUrl = `https://${domain}/${businessSlug}`;
    const resolvedBrand = resolveCustomerPortalBrandColor(brandColor);
    const resolvedBg = resolveCustomerPortalBrandColor(reviewPageBackgroundColor || brandColor);
    const resolvedFg = contrastTextForHexBackground(resolvedBg);

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
            } catch {
            } finally {
                setLoading(false);
            }
        };
        fetchQr();
    }, [businessId]);

    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(portalUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    }, [portalUrl]);

    const handleShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Leave us a review!",
                    url: portalUrl,
                });
                return;
            } catch {
            }
        }
        handleCopyLink();
    }, [handleCopyLink, portalUrl]);

    const handleDownload = useCallback(() => {
        if (!qrDataUrl) return;
        runBrandedQrPosterDownload({
            qrDataUrl,
            businessSlug,
            businessName,
            businessLogoUrl,
            resolvedBrand,
            resolvedBg,
            resolvedFg,
            domain,
        });
    }, [
        qrDataUrl,
        businessSlug,
        businessName,
        businessLogoUrl,
        resolvedBrand,
        resolvedBg,
        resolvedFg,
        domain,
    ]);

    const handlePrint = useCallback(() => {
        if (!qrDataUrl) return;
        openCustomerPortalPrintWindow({
            qrDataUrl,
            businessSlug,
            businessName,
            businessLogoUrl,
            posterBg: resolvedBg,
            posterFg: resolvedFg,
            domain,
        });
    }, [qrDataUrl, businessSlug, businessName, businessLogoUrl, resolvedBg, resolvedFg, domain]);

    return {
        copied,
        showQr,
        setShowQr,
        qrDataUrl,
        loading,
        domain,
        portalUrl,
        handleCopyLink,
        handleShare,
        handleDownload,
        handlePrint,
    };
}
