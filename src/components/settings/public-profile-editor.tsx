"use client";

import { usePublicProfileEditorPreview } from "./use-public-profile-editor-preview";
import { usePublicProfileEditorQrShare } from "./use-public-profile-editor-qr-share";
import type { PublicProfileEditorProps } from "./public-profile-editor-types";
import { PublicProfileEditorFormColumn } from "./public-profile-editor-form-column";
import { PublicProfileEditorPreviewColumn } from "./public-profile-editor-preview-column";

export function PublicProfileEditor({ business, initialSlug }: PublicProfileEditorProps) {
    const p = usePublicProfileEditorPreview(business, initialSlug);
    const q = usePublicProfileEditorQrShare(business.id, business.name, initialSlug, p.previewUrl);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
            <PublicProfileEditorFormColumn
                business={business}
                initialSlug={initialSlug}
                onSlugChange={p.handleSlugChange}
                onValuesChange={p.handleValuesChange}
                onLogoChange={p.handleLogoChange}
                onTabChange={p.handleTabChange}
            />

            <PublicProfileEditorPreviewColumn
                business={business}
                previewState={p.previewState}
                previewStep={p.previewStep}
                previewBackdrop={p.previewBackdrop}
                previewUrl={p.previewUrl}
                copied={q.copied}
                onShare={q.handleShare}
                onOpenQr={() => q.setQrDialogOpen(true)}
                qrDialogOpen={q.qrDialogOpen}
                onQrDialogOpenChange={q.setQrDialogOpen}
                qrLoading={q.qrLoading}
                qrDataUrl={q.qrDataUrl}
                onDownloadQr={() => q.handleDownloadQr(p.previewState.slug || initialSlug)}
                onPrintQr={q.handlePrintQr}
            />
        </div>
    );
}
