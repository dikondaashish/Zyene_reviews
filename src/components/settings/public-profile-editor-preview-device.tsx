"use client";

import { PublicReviewFlow } from "@/app/r/[slug]/review-flow";
import { HelpCircle } from "lucide-react";
import type { PublicProfileBusinessRecord, PublicProfilePreviewValues } from "@/types/components";
import { buildPublicReviewFlowPreviewProps } from "./public-profile-editor-preview-flow-props";

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
            <div className="flex items-center gap-2 mb-3 justify-start px-1">
                <span className="text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase">
                    PREVIEW
                </span>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>

            <div className="mx-auto h-[700px] w-full rounded-[2.5rem] overflow-hidden relative border-[4px] border-foreground ring-1 ring-border">
                <div className="h-8 w-full bg-transparent absolute top-0 z-20 pointer-events-none" />

                <div className="h-full w-full overflow-y-auto no-scrollbar" style={{ background: previewBackdrop }}>
                    <PublicReviewFlow {...flowProps} />
                </div>
            </div>
        </div>
    );
}
