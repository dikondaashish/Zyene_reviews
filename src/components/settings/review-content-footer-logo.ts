"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";
import { createClient } from "@/lib/db/supabase/client";
import type { ContentFormValues } from "@/components/settings/review-content-schema";

export function useReviewContentFooterLogo(
    form: UseFormReturn<ContentFormValues>,
    businessId: string
) {
    const supabase = createClient();
    const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

    const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size too large (max 2MB)");
            return;
        }

        const currentLogo = form.getValues("footer_logo_url");
        if (currentLogo && currentLogo.includes("supabase.co") && !currentLogo.includes("/zyene-footer.png")) {
            setFilesToDelete((prev) => [...prev, currentLogo]);
        }

        setUploadingFooterLogo(true);
        try {
            const fileName = `footer-${businessId}-${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from("business-logos").upload(fileName, file);
            if (error) throw error;

            const {
                data: { publicUrl },
            } = supabase.storage.from("business-logos").getPublicUrl(fileName);
            form.setValue("footer_logo_url", publicUrl, { shouldDirty: true, shouldTouch: true });
            toast.success("Footer logo uploaded!");
        } catch {
            toast.error("Failed to upload logo");
        } finally {
            setUploadingFooterLogo(false);
        }
    };

    const removeFooterLogo = () => {
        const currentLogo = form.getValues("footer_logo_url");
        if (currentLogo && currentLogo.includes("supabase.co") && !currentLogo.includes("/zyene-footer.png")) {
            setFilesToDelete((prev) => [...prev, currentLogo]);
        }
        form.setValue("footer_logo_url", "", { shouldDirty: true, shouldTouch: true });
        toast.success("Footer logo removed");
    };

    return { uploadingFooterLogo, filesToDelete, setFilesToDelete, handleFooterLogoUpload, removeFooterLogo, supabase };
}
