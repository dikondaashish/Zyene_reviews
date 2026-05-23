"use client";

import { useState, useEffect, useCallback } from "react";

export function useQrCodeData(businessId: string) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [reviewUrl, setReviewUrl] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [apiLogoUrl, setApiLogoUrl] = useState<string | null>(null);
    const [apiBrandColor, setApiBrandColor] = useState<string | null>(null);
    const [apiPageBg, setApiPageBg] = useState<string | null>(null);

    const fetchQRCode = useCallback(async () => {
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
    }, [businessId]);

    useEffect(() => {
        void fetchQRCode();
    }, [fetchQRCode]);

    return {
        qrDataUrl,
        reviewUrl,
        loading,
        error,
        apiLogoUrl,
        apiBrandColor,
        apiPageBg,
        fetchQRCode,
    };
}
