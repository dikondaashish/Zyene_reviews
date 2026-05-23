"use client";

import type { PublicProfileBusinessRecord, PublicProfilePreviewValues } from "@/types/components";
import { PublicProfileEditorPreviewDevice } from "./public-profile-editor-preview-device";
import { PublicProfileEditorShareQrBlock } from "./public-profile-editor-share-qr-block";

interface PublicProfileEditorPreviewColumnProps {
    business: PublicProfileBusinessRecord;
    previewState: PublicProfilePreviewValues;
    previewStep: "rating" | "tags" | "generating" | "review" | "thankyou" | "negative";
    previewBackdrop: string;
    previewUrl: string;
    copied: boolean;
    onShare: () => void;
    onOpenQr: () => void;
    qrDialogOpen: boolean;
    onQrDialogOpenChange: (open: boolean) => void;
    qrLoading: boolean;
    qrDataUrl: string | null;
    onDownloadQr: () => void;
    onPrintQr: () => void;
}

export function PublicProfileEditorPreviewColumn(props: PublicProfileEditorPreviewColumnProps) {
    const {
        business,
        previewState,
        previewStep,
        previewBackdrop,
        previewUrl,
        copied,
        onShare,
        onOpenQr,
        qrDialogOpen,
        onQrDialogOpenChange,
        qrLoading,
        qrDataUrl,
        onDownloadQr,
        onPrintQr,
    } = props;

    return (
        <div className="hidden xl:flex flex-col gap-5 sticky top-6 order-1 xl:order-2">
            <PublicProfileEditorPreviewDevice
                business={business}
                previewState={previewState}
                previewStep={previewStep}
                previewBackdrop={previewBackdrop}
            />
            <PublicProfileEditorShareQrBlock
                previewUrl={previewUrl}
                copied={copied}
                onShare={onShare}
                onOpenQr={onOpenQr}
                qrDialogOpen={qrDialogOpen}
                onQrDialogOpenChange={onQrDialogOpenChange}
                qrLoading={qrLoading}
                qrDataUrl={qrDataUrl}
                onDownloadQr={onDownloadQr}
                onPrintQr={onPrintQr}
            />
        </div>
    );
}
