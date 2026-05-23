"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_REVIEW_PAGE_BACKGROUND_HEX, reviewPageBackdropGradient } from "@/lib/utils/review-page-background";
import type { PublicProfileBusinessRecord, PublicProfilePreviewValues } from "@/types/components";
import { buildInitialPublicProfilePreview } from "./public-profile-editor-initial-preview";

export function usePublicProfileEditorPreview(business: PublicProfileBusinessRecord, initialSlug: string) {
    const [previewState, setPreviewState] = useState<PublicProfilePreviewValues>(() =>
        buildInitialPublicProfilePreview(business, initialSlug),
    );
    const [activeTab, setActiveTab] = useState("rating");

    const handleValuesChange = useCallback((values: Partial<PublicProfilePreviewValues>) => {
        setPreviewState((prev) => ({ ...prev, ...values }));
    }, []);

    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab);
    }, []);

    const getPreviewStep = (tab: string): "rating" | "tags" | "generating" | "review" | "thankyou" | "negative" => {
        switch (tab) {
            case "rating":
                return "rating";
            case "tags":
                return "tags";
            case "google":
                return "review";
            case "feedback":
                return "negative";
            case "success":
                return "thankyou";
            default:
                return "rating";
        }
    };

    const previewStep = getPreviewStep(activeTab);

    const handleSlugChange = useCallback(
        (slug: string) => {
            handleValuesChange({ slug });
        },
        [handleValuesChange],
    );

    const handleLogoChange = useCallback(
        (url: string | null) => {
            handleValuesChange({ logo_url: url });
        },
        [handleValuesChange],
    );

    const previewUrl = `zyenereviews.com/${previewState.slug || initialSlug}`;
    const fullUrl = `https://${previewUrl}`;
    const previewBackdrop =
        previewState.review_page_background_color &&
        /^#([0-9A-F]{3}){1,2}$/i.test(previewState.review_page_background_color)
            ? reviewPageBackdropGradient(previewState.review_page_background_color)
            : reviewPageBackdropGradient(DEFAULT_REVIEW_PAGE_BACKGROUND_HEX);

    useEffect(() => {
        setPreviewState((prev) => ({ ...prev, slug: initialSlug }));
    }, [initialSlug]);

    return {
        previewState,
        handleValuesChange,
        handleTabChange,
        previewStep,
        handleSlugChange,
        handleLogoChange,
        previewUrl,
        fullUrl,
        previewBackdrop,
    };
}
