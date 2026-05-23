"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { BusinessSettingsRecord } from "@/types/components";
import { reviewSettingsSchema, type ReviewSettingsValues } from "./review-settings-form-schema";

export function useReviewSettingsForm(business: BusinessSettingsRecord) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ReviewSettingsValues>({
        resolver: zodResolver(reviewSettingsSchema),
        defaultValues: {
            review_request_delay_minutes: business.review_request_delay_minutes ?? 120,
            review_request_min_amount_cents: (business.review_request_min_amount_cents ?? 1500) / 100,
            review_request_frequency_cap_days: business.review_request_frequency_cap_days ?? 30,
            review_request_sms_enabled: business.review_request_sms_enabled ?? true,
            review_request_email_enabled: business.review_request_email_enabled ?? true,
        },
    });

    async function onSubmit(data: ReviewSettingsValues) {
        setIsLoading(true);
        const payload = {
            ...data,
            review_request_min_amount_cents: Math.round(data.review_request_min_amount_cents * 100),
        };

        try {
            const response = await fetch(`/api/businesses/${business.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update review settings");
            }

            toast.success("Review settings updated");
            form.reset(data);
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return { form, isLoading, onSubmit };
}
