"use client";

import { PublicReviewFlow } from "@/app/r/[slug]/review-flow";
import { Smartphone } from "lucide-react";
import type { PublicProfileBusinessRecord, PublicProfilePreviewValues } from "@/types/components";
import { buildPublicReviewFlowPreviewProps } from "@/components/settings/public-profile-editor-preview-flow-props";
import { PublicProfileMobileViewport } from "@/components/settings/public-profile-mobile-viewport";

interface PublicProfileEditorPreviewDeviceProps {
    business: PublicProfileBusinessRecord;
    previewState: PublicProfilePreviewValues;
    previewStep: "rating" | "tags" | "generating" | "review" | "thankyou" | "negative";
    previewBackdrop: string;
}

export function PublicProfileEditorPreviewDevice({
    business,
    previewState,
    previewStep,
    previewBackdrop,
}: PublicProfileEditorPreviewDeviceProps) {
    const flowProps = buildPublicReviewFlowPreviewProps(business, previewState, previewStep);

    return (
        <div>
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <span className="text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase">
                    PREVIEW
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Smartphone className="size-3.5" aria-hidden="true" /> Mobile
                </span>
            </div>

            <div className="relative mx-auto h-[min(680px,calc(100dvh-190px))] min-h-64 w-full max-w-[390px] overflow-hidden rounded-[2.5rem] border-[4px] border-foreground bg-background shadow-xl ring-1 ring-border" style={{ background: previewBackdrop }}>
                <PublicProfileMobileViewport>
                    <PublicReviewFlow {...flowProps} />
                </PublicProfileMobileViewport>
            </div>
        </div>
    );
}
