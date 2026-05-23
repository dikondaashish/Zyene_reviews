"use client";

import { Loader2, Upload, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";

type BrandingFormLogoPanelProps = {
    uploadingLogo: boolean;
    logoUrl: string | null | undefined;
    onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
    onRemoveLogo: () => void | Promise<void>;
};

export function BrandingFormLogoPanel({
    uploadingLogo,
    logoUrl,
    onLogoUpload,
    onRemoveLogo,
}: BrandingFormLogoPanelProps) {
    return (
        <div className="space-y-4">
            <FormLabel className="text-base font-medium text-foreground">Business Logo</FormLabel>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative h-28 w-28 rounded-2xl border-2 border-border bg-muted/50 overflow-hidden flex items-center justify-center shrink-0">
                    {uploadingLogo ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="Business Logo" className="object-cover h-full w-full" />
                    ) : (
                        <div className="text-center p-2">
                            <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground font-medium">No Logo</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3 pt-1">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                className="relative h-9 px-4 border-border hover:bg-muted font-medium bg-card"
                                disabled={uploadingLogo}
                            >
                                <Upload className="mr-2 h-3.5 w-3.5" />
                                Upload Logo
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={onLogoUpload}
                                    disabled={uploadingLogo}
                                />
                            </Button>
                        </div>
                        {logoUrl ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                onClick={onRemoveLogo}
                                disabled={uploadingLogo}
                            >
                                <Trash className="mr-2 h-3.5 w-3.5" />
                                Remove
                            </Button>
                        ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Upload your business logo. Recommended size: 512x512px.
                        <br />
                        Supported formats: PNG, JPG, WebP. Max 2MB.
                    </p>
                </div>
            </div>
        </div>
    );
}
