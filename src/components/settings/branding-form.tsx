"use client";

import { Form } from "@/components/ui/form";
import type { BrandingFormProps } from "@/components/settings/branding-form-types";
import { useBrandingFormCore } from "@/components/settings/use-branding-form-core";
import { useBrandingLogoCrop } from "@/components/settings/use-branding-logo-crop";
import { BrandingFormLogoPanel } from "@/components/settings/branding-form-logo-panel";
import { BrandingFormColorsPanel } from "@/components/settings/branding-form-colors-panel";
import { BrandingFormCropDialog } from "@/components/settings/branding-form-crop-dialog";

export type { BrandingFormProps } from "@/components/settings/branding-form-types";
export type { BrandingFormValues } from "@/components/settings/branding-form-schema";

export function BrandingForm({ business, onValuesChange, onLogoChange }: BrandingFormProps) {
    const { form, isLoading, onSubmit } = useBrandingFormCore(business, onValuesChange);
    const logo = useBrandingLogoCrop({
        businessId: business.id,
        initialLogoUrl: business.logo_url,
        onLogoChange,
    });

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-8">
            <Form {...form}>
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-foreground">Brand Identity</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize your review page to match your brand&apos;s look and feel.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <BrandingFormLogoPanel
                        uploadingLogo={logo.uploadingLogo}
                        logoUrl={logo.logoUrl}
                        onLogoUpload={logo.handleLogoUpload}
                        onRemoveLogo={logo.removeLogo}
                    />
                    <BrandingFormColorsPanel form={form} isLoading={isLoading} onSubmit={onSubmit} />
                </div>
            </Form>

            <BrandingFormCropDialog
                open={!!logo.selectedImage}
                onOpenChange={(open) => {
                    if (!open && !logo.uploadingLogo) {
                        logo.setSelectedImage(null);
                        logo.setSelectedFile(null);
                    }
                }}
                selectedImage={logo.selectedImage}
                crop={logo.crop}
                onCropChange={logo.setCrop}
                onCropComplete={logo.setCompletedCrop}
                completedCrop={logo.completedCrop}
                imgRef={logo.imgRef}
                uploadingLogo={logo.uploadingLogo}
                onCancelCrop={() => {
                    logo.setSelectedImage(null);
                    logo.setSelectedFile(null);
                }}
                onSaveCrop={logo.handleSaveCrop}
            />
        </div>
    );
}
