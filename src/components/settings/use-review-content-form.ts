"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/db/supabase/client";
import type { PublicProfilePreviewValues } from "@/types/components";
import {
    customTagsForPreview,
    parseTagsToItems,
    type ReviewTagItem,
} from "@/lib/review-flow/tag-display";
import { contentSchema, type ContentFormValues } from "@/components/settings/review-content-schema";
import { reviewContentFormDefaults } from "@/components/settings/review-content-form-defaults";
import { submitReviewContentSettings } from "@/components/settings/review-content-form-submit";
import { useReviewContentFooterLogo } from "@/components/settings/review-content-footer-logo";
import { useReviewContentFormLoad } from "@/components/settings/use-review-content-form-load";

export function useReviewContentForm(
    businessId: string,
    businessCategory: string,
    onValuesChange?: (values: Partial<PublicProfilePreviewValues>) => void
) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ContentFormValues>({
        resolver: zodResolver(contentSchema),
        defaultValues: reviewContentFormDefaults,
    });

    const categoryKey = businessCategory.toLowerCase().trim() || "other";
    const [tagCategory, setTagCategory] = useState(categoryKey);
    const [tagItems, setTagItems] = useState<ReviewTagItem[]>(() =>
        parseTagsToItems(null, categoryKey)
    );
    const [tagsReady, setTagsReady] = useState(false);

    const { uploadingFooterLogo, filesToDelete, setFilesToDelete, handleFooterLogoUpload, removeFooterLogo, supabase: logoSupabase } =
        useReviewContentFooterLogo(form, businessId);

    const pushPreview = useCallback(
        (value: Partial<ContentFormValues>) => {
            if (!onValuesChange) return;
            const staffNamesArray = value.staff_names
                ? value.staff_names.split(",").map((t) => t?.trim()).filter((t) => t && t.length > 0)
                : [];

            onValuesChange({
                ...value,
                custom_tags: customTagsForPreview(tagItems, tagCategory),
                staff_names: staffNamesArray,
            });
        },
        [onValuesChange, tagCategory, tagItems]
    );

    useEffect(() => {
        if (!tagsReady) return;
        pushPreview(form.getValues() as ContentFormValues);
    }, [tagItems, tagsReady, pushPreview, form]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (!tagsReady) return;
            pushPreview(value);
        });
        return () => subscription.unsubscribe();
    }, [form, pushPreview, tagsReady]);

    useReviewContentFormLoad(
        businessId,
        categoryKey,
        supabase,
        form,
        setIsLoading,
        setTagCategory,
        setTagItems,
        setTagsReady,
        tagsReady
    );

    async function onSubmit(data: ContentFormValues) {
        setIsSaving(true);
        try {
            await submitReviewContentSettings({
                data,
                businessId,
                tagItems,
                tagCategory,
                filesToDelete,
                setFilesToDelete,
                form,
                supabase: logoSupabase,
                onSaved: () => router.refresh(),
            });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save content settings");
        } finally {
            setIsSaving(false);
        }
    }

    return {
        form,
        isLoading,
        isSaving,
        onSubmit,
        uploadingFooterLogo,
        handleFooterLogoUpload,
        removeFooterLogo,
        tagCategory,
        tagItems,
        setTagItems,
        tagsReady,
    };
}
