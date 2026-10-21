"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { BusinessSettingsRecord } from "@/types/components";
import { ReviewSettingsFormChannelFields } from "./review-settings-form-channel-fields";
import { ReviewSettingsFormTimingFields } from "./review-settings-form-timing-fields";
import { ReviewSettingsFormQuietHoursFields } from "./review-settings-form-quiet-hours-fields";
import { useReviewSettingsForm } from "./use-review-settings-form";

interface ReviewSettingsFormProps {
    business: BusinessSettingsRecord;
}

export function ReviewSettingsForm({ business }: ReviewSettingsFormProps) {
    const { form, isLoading, onSubmit } = useReviewSettingsForm(business);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <ReviewSettingsFormTimingFields form={form} />
                <ReviewSettingsFormChannelFields form={form} />
                <ReviewSettingsFormQuietHoursFields form={form} timezone={business.timezone ?? null} />
                <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
                    {isLoading && <Loader2 className="mr-2 animate-spin size-4" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}
