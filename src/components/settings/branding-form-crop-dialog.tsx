"use client";

import type { RefObject } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type BrandingFormCropDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedImage: string | null;
    crop: Crop;
    onCropChange: (c: Crop) => void;
    onCropComplete: (c: PixelCrop) => void;
    completedCrop: PixelCrop | null;
    imgRef: RefObject<HTMLImageElement | null>;
    uploadingLogo: boolean;
    onCancelCrop: () => void;
    onSaveCrop: () => void | Promise<void>;
};

export function BrandingFormCropDialog({
    open,
    onOpenChange,
    selectedImage,
    crop,
    onCropChange,
    onCropComplete,
    completedCrop,
    imgRef,
    uploadingLogo,
    onCancelCrop,
    onSaveCrop,
}: BrandingFormCropDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crop your logo</DialogTitle>
                    <DialogDescription>Adjust your logo to a perfect square before saving.</DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-center p-4 bg-muted/20 border border-border rounded-xl min-h-[300px]">
                    {selectedImage ? (
                        <ReactCrop
                            crop={crop}
                            onChange={onCropChange}
                            onComplete={onCropComplete}
                            aspect={1}
                            circularCrop={false}
                            className="max-h-[400px]"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                ref={imgRef}
                                src={selectedImage}
                                alt="Crop me"
                                onLoad={(e) => {
                                    const { width, height } = e.currentTarget;
                                    const size = Math.min(width, height, 300);
                                    const x = (width - size) / 2;
                                    const y = (height - size) / 2;
                                    const initialCrop = { unit: "px" as const, width: size, height: size, x, y };
                                    onCropChange(initialCrop);
                                    onCropComplete(initialCrop);
                                }}
                                className="max-h-[400px] object-contain"
                            />
                        </ReactCrop>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancelCrop} disabled={uploadingLogo}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSaveCrop}
                        disabled={uploadingLogo || !completedCrop?.width || !completedCrop?.height}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {uploadingLogo ? <Loader2 className="mr-2 animate-spin size-4" /> : null}
                        {uploadingLogo ? "Saving..." : "Save Crop"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
