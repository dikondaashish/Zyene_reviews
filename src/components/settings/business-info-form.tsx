"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { ReviewRequestSender } from "@/lib/email/review-request-from-line";
import type { BusinessSettingsRecord } from "@/types/components";

import { BusinessInfoFormAddressFields } from "./business-info-form-address-fields";
import { BusinessInfoFormContactFields } from "./business-info-form-contact-fields";
import { BusinessInfoFormCoreFields } from "./business-info-form-core-fields";
import { BusinessInfoFormMetaFields } from "./business-info-form-meta-fields";
import { BusinessInfoSenderPreview } from "./business-info-sender-preview";
import { useBusinessInfoForm } from "./use-business-info-form";

interface BusinessInfoFormProps {
    business: BusinessSettingsRecord;
    sender: ReviewRequestSender;
}

export function BusinessInfoForm({ business, sender }: BusinessInfoFormProps) {
    const { form, isLoading, onSubmit } = useBusinessInfoForm(business);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <BusinessInfoFormCoreFields form={form} />
                <BusinessInfoFormContactFields form={form} />
                <BusinessInfoFormAddressFields form={form} />
                <BusinessInfoFormMetaFields form={form} />
                <BusinessInfoSenderPreview form={form} sender={sender} slug={typeof business.slug === "string" ? business.slug : null} />
                <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
                    {isLoading && <Loader2 className="mr-2 animate-spin size-4" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    );
}
