"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    brandingFormSchema,
    type BrandingFormValues,
} from "@/components/settings/branding-form-schema";
import { patchBrandingBusiness } from "@/components/settings/branding-form-patch-business";
import {
    DEFAULT_BRAND_COLOR_HEX,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
} from "@/lib/utils/review-page-background";
import type { BrandingFormProps } from "@/components/settings/branding-form-types";

export function useBrandingFormCore(
    business: BrandingFormProps["business"],
    onValuesChange?: BrandingFormProps["onValuesChange"]
) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<BrandingFormValues>({
        resolver: zodResolver(brandingFormSchema),
        defaultValues: {
            brand_color: (business.brand_color || DEFAULT_BRAND_COLOR_HEX).toLowerCase(),
            review_page_background_color: (
                business.review_page_background_color || DEFAULT_REVIEW_PAGE_BACKGROUND_HEX
            ).toLowerCase(),
        },
    });

    const watchedValues = form.watch();

    useEffect(() => {
        onValuesChange?.(watchedValues);
    }, [JSON.stringify(watchedValues), onValuesChange]);

    const onSubmit = async (data: BrandingFormValues) => {
        setIsLoading(true);
        try {
            await patchBrandingBusiness(business.id, data);
            router.refresh();
            form.reset(data);
            toast.success("Branding updated");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to save changes");
        } finally {
            setIsLoading(false);
        }
    };

    return { form, isLoading, onSubmit };
}
