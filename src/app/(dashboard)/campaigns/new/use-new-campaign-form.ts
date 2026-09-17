"use client";

import { renderCampaignPreview, type CampaignPreviewContext } from "@/lib/campaigns/preview";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { toast } from "sonner";
import { createAndQueueCampaign } from "@/app/(dashboard)/campaigns/new/create-and-queue-campaign";
import {
    DEFAULT_EMAIL_BODY,
    DEFAULT_EMAIL_SUBJECT,
    DEFAULT_FOLLOW_UP,
    DEFAULT_SMS,
} from "./new-campaign-constants";
import type { CampaignForm } from "./new-campaign-form-types";

export function useNewCampaignForm(context: CampaignPreviewContext) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");
    const customerIdsParam = searchParams.get("customerIds");
    const customerIds = [...new Set((customerIdsParam ?? "").split(",").map(id => id.trim()).filter(Boolean))];
    const preselectedCustomerCount = customerIds.length;
    const [createdCampaignId, setCreatedCampaignId] = useState<string>();
    const [saveError, setSaveError] = useState("");
    const submitting = useRef(false);
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<CampaignForm>({
        name: "",
        channel: "sms",
        trigger_type: "manual_batch",
        sms_template: DEFAULT_SMS,
        email_subject: DEFAULT_EMAIL_SUBJECT,
        email_template: DEFAULT_EMAIL_BODY,
        delay_minutes: 0,
        follow_up_enabled: false,
        follow_up_delay_hours: 168,
        follow_up_template: DEFAULT_FOLLOW_UP,
        drip_step3_template: "",
    });

    useEffect(() => {
        if (templateId) {
            const template = CAMPAIGN_TEMPLATES.find((t) => t.id === templateId);
            if (template) {
                setForm((prev) => ({
                    ...prev,
                    ...template.defaultValues,
                    ...(customerIdsParam ? { trigger_type: "manual_batch" as const } : {}),
                }));
            }
        }
    }, [templateId, customerIdsParam]);

    const updateForm = (updates: Partial<CampaignForm>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    };

    const previewSMS = renderCampaignPreview(form.sms_template, context);
    const smsCharCount = previewSMS.length;

    const canProceed = () => {
        switch (step) {
            case 0:
                return form.name.trim().length > 0;
            case 1:
                if (form.channel === "sms" || form.channel === "both") {
                    return form.sms_template.trim().length > 0 && (form.channel !== "both" || Boolean(form.email_subject.trim() && form.email_template.trim()));
                }
                if (form.channel === "email") {
                    return form.email_subject.trim().length > 0 && form.email_template.trim().length > 0;
                }
                return true;
            case 2:
                return true;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const saveCampaign = async (status: "draft" | "active") => {
        if (submitting.current) return;
        if (customerIds.length > 500) { setSaveError("Choose up to 500 customers for one campaign."); return; }
        submitting.current = true;
        setSaving(true);
        setSaveError("");
        try {
            const result = await createAndQueueCampaign({ form, status, customerIds,
                existingCampaignId: createdCampaignId, onCreated: setCreatedCampaignId });
            toast.success(result.queuedCount > 0
                ? `${result.queuedCount} contacts queued · ${result.skippedCount} skipped`
                : status === "draft" ? "Campaign saved. Add recipients when you are ready." : "Campaign created. Add contacts to start sending.");
            router.push(`/campaigns/${result.campaignId}`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Could not save the campaign. Try again.";
            setSaveError(message);
            toast.error(message);
        } finally {
            submitting.current = false;
            setSaving(false);
        }
    };

    return {
        router,
        step,
        setStep,
        saving,
        createdCampaignId,
        saveError,
        form,
        updateForm,
        preselectedCustomerCount,
        smsCharCount,
        previewSMS,
        canProceed,
        saveCampaign,
    };
}
