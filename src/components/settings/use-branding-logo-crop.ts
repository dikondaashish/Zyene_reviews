"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/db/supabase/client";
import { getBrandingCroppedImageFile } from "@/components/settings/branding-form-cropped-file";
import { patchBrandingBusiness } from "@/components/settings/branding-form-patch-business";
import { removeBrandingLogoFromStorage } from "@/components/settings/branding-form-remove-stored-logo";
import type { Crop, PixelCrop } from "react-image-crop";

export function useBrandingLogoCrop({
    businessId,
    initialLogoUrl,
    onLogoChange,
}: {
    businessId: string;
    initialLogoUrl?: string | null;
    onLogoChange?: (url: string | null) => void;
}) {
    const router = useRouter();
    const supabase = createClient();
    const [logoUrl, setLogoUrl] = useState<string | null | undefined>(initialLogoUrl);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: "px", width: 256, height: 256, x: 0, y: 0 });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setLogoUrl(initialLogoUrl);
    }, [initialLogoUrl]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size too large (max 2MB)");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            toast.error("Unsupported file format (PNG, JPG, WebP only)");
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setSelectedImage(reader.result?.toString() || null);
            setCrop({ unit: "px", width: 256, height: 256, x: 0, y: 0 });
            setCompletedCrop(null);
        });
        reader.readAsDataURL(file);
        setSelectedFile(file);
        e.target.value = "";
    };

    const handleSaveCrop = async () => {
        if (!selectedImage || !completedCrop || !imgRef.current || !selectedFile) {
            toast.error("Please crop your image or click cancel.");
            return;
        }

        setUploadingLogo(true);
        try {
            const croppedFile = await getBrandingCroppedImageFile(
                imgRef.current,
                completedCrop,
                `${businessId}-${Date.now()}-logo.webp`
            );

            const { error: uploadError } = await supabase.storage.from("business-logos").upload(croppedFile.name, croppedFile);

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("business-logos").getPublicUrl(croppedFile.name);

            await patchBrandingBusiness(businessId, { logo_url: publicUrl });

            if (logoUrl) {
                await removeBrandingLogoFromStorage(supabase, logoUrl);
            }

            setLogoUrl(publicUrl);
            onLogoChange?.(publicUrl);
            setSelectedImage(null);
            setSelectedFile(null);
            toast.success("Logo uploaded successfully!");
            router.refresh();
        } catch {
            toast.error("Failed to save logo. Please try again.");
        } finally {
            setUploadingLogo(false);
        }
    };

    const removeLogo = async () => {
        const oldLogoUrl = logoUrl;
        try {
            await patchBrandingBusiness(businessId, { logo_url: null });
            setLogoUrl(undefined);
            onLogoChange?.(null);

            if (oldLogoUrl) {
                await removeBrandingLogoFromStorage(supabase, oldLogoUrl);
            }
            toast.success("Logo removed");
            router.refresh();
        } catch {
        }
    };

    return {
        logoUrl,
        uploadingLogo,
        selectedImage,
        setSelectedImage,
        selectedFile,
        setSelectedFile,
        crop,
        setCrop,
        completedCrop,
        setCompletedCrop,
        imgRef,
        handleLogoUpload,
        handleSaveCrop,
        removeLogo,
    };
}
