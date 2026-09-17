"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    const [previewOpen, setPreviewOpen] = useState(false);
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
        <div className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-6">
            <Button variant="outline" className="xl:hidden" aria-expanded={previewOpen} aria-controls="public-profile-live-preview" onClick={() => setPreviewOpen(!previewOpen)}><Eye className="size-4" />{previewOpen ? "Hide preview" : "Preview review page"}</Button>
            <div id="public-profile-live-preview" className={previewOpen ? "block" : "hidden xl:block"}>
            <PublicProfileEditorPreviewDevice
                business={business}
                previewState={previewState}
                previewStep={previewStep}
                previewBackdrop={previewBackdrop}
            />
            </div>
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
