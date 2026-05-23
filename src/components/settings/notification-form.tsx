"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { NotificationPreferenceFormValues } from "@/types/components";

import { NotificationFormEmailFields } from "./notification-form-email-fields";
import { NotificationFormSmsFields } from "./notification-form-sms-fields";
import { useNotificationForm } from "./use-notification-form";

export function NotificationForm({
    businessId,
    initialPrefs,
}: {
    businessId: string;
    initialPrefs: NotificationPreferenceFormValues;
    userId?: string;
}) {
    const { form, isSaving, onSubmit } = useNotificationForm(businessId, initialPrefs);

    return (
        <TooltipProvider delayDuration={200}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">
                    <NotificationFormEmailFields form={form} />
                    <NotificationFormSmsFields form={form} />
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Preferences"}
                    </Button>
                </form>
            </Form>
        </TooltipProvider>
    );
}
