"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { NotificationPreferenceFormValues } from "@/types/components";
import {
    notificationFormSchema,
    type NotificationFormValues,
} from "./notification-form-schema";

export function useNotificationForm(
    businessId: string,
    initialPrefs: NotificationPreferenceFormValues,
) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues: {
            sms_enabled: initialPrefs?.sms_enabled ?? true,
            phone_number:
                initialPrefs?.phone_number ||
                initialPrefs?.sms_phone_number ||
                "",
            email_enabled: initialPrefs?.email_enabled ?? true,
            digest_enabled: initialPrefs?.digest_enabled ?? true,
            min_urgency_score: (
                initialPrefs?.min_urgency_score ?? initialPrefs?.min_urgency_for_sms ?? 7
            ).toString(),
            quiet_hours_start: initialPrefs?.quiet_hours_start || "",
            quiet_hours_end: initialPrefs?.quiet_hours_end || "",
        },
    });

    async function onSubmit(data: NotificationFormValues) {
        setIsSaving(true);
        try {
            const minUrgency = Number.parseInt(data.min_urgency_score, 10);
            const payload = {
                business_id: businessId,
                sms_enabled: data.sms_enabled,
                email_enabled: data.email_enabled,
                digest_enabled: data.digest_enabled,
                phone_number: data.phone_number?.trim() || null,
                min_urgency_score: Number.isFinite(minUrgency) ? minUrgency : 7,
                quiet_hours_start: data.quiet_hours_start?.trim() || null,
                quiet_hours_end: data.quiet_hours_end?.trim() || null,
            };

            const res = await fetch("/api/settings/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save settings");

            toast.success("Notification settings saved");
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    }

    return { form, isSaving, onSubmit };
}
