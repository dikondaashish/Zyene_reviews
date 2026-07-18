"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { toast } from "sonner";
import {
    DEFAULT_EMAIL_BODY,
    DEFAULT_EMAIL_SUBJECT,
    DEFAULT_FOLLOW_UP,
    DEFAULT_SMS,
} from "./new-campaign-constants";
import type { CampaignForm } from "./new-campaign-form-types";

export function useNewCampaignForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");
    const customerIdsParam = searchParams.get("customerIds");
    const preselectedCustomerCount = customerIdsParam
        ? customerIdsParam.split(",").filter((id) => id.trim().length > 0).length
        : 0;
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
                }));
            }
        }
    }, [templateId]);

    const updateForm = (updates: Partial<CampaignForm>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    };

    const smsCharCount = form.sms_template.length;

    const previewSMS = form.sms_template
        .replace(/\{customer_name\}/g, "Sarah")
        .replace(/\{business_name\}/g, "Sunrise Café")
        .replace(/\{review_link\}/g, `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/sunrise-cafe`);

    const canProceed = () => {
        switch (step) {
            case 0:
                return form.name.trim().length > 0;
            case 1:
                if (form.channel === "sms" || form.channel === "both") {
                    return form.sms_template.trim().length > 0;
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
        setSaving(true);
        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, status }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create campaign");
            }

            toast.success(status === "active" ? "Campaign launched!" : "Campaign saved as draft");
            router.push("/campaigns");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return {
        router,
        step,
        setStep,
        saving,
        form,
        updateForm,
        preselectedCustomerCount,
        smsCharCount,
        previewSMS,
        canProceed,
        saveCampaign,
    };
}
