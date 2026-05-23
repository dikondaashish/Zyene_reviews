"use client";

import type { UseFormReturn } from "react-hook-form";

import { SettingsSectionLabel } from "@/components/settings/settings-section-label";
import type { NotificationFormValues } from "./notification-form-schema";
import { NotificationFormSmsDetailsFields } from "./notification-form-sms-details-fields";
import { NotificationFormSmsToggleField } from "./notification-form-sms-toggle-field";

export function NotificationFormSmsFields({ form }: { form: UseFormReturn<NotificationFormValues> }) {
    const smsEnabled = form.watch("sms_enabled");

    return (
        <>
            <SettingsSectionLabel id="notif-sms">Text messages</SettingsSectionLabel>
            <NotificationFormSmsToggleField form={form} />
            {smsEnabled && <NotificationFormSmsDetailsFields form={form} />}
        </>
    );
}
