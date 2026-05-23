"use client";

import type { UseFormReturn } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { NotificationFormFieldHelpTip } from "./notification-form-field-help-tip";
import type { NotificationFormValues } from "./notification-form-schema";

export function NotificationFormSmsToggleField({ form }: { form: UseFormReturn<NotificationFormValues> }) {
    return (
        <FormField
            control={form.control}
            name="sms_enabled"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-2">
                            <FormLabel className="text-base">SMS alerts</FormLabel>
                            <NotificationFormFieldHelpTip label="What SMS alerts do">
                                <p>
                                    Sends a <strong>text message</strong> only for urgent review alerts: when the
                                    urgency score is at or above your minimum, or the review is{" "}
                                    <strong>1–2 stars</strong>. You must save a phone number below. Texts pause
                                    during quiet hours. Customer review-request texts are separate from this
                                    setting.
                                </p>
                            </NotificationFormFieldHelpTip>
                        </div>
                        <FormDescription>Receive text messages for urgent reviews.</FormDescription>
                    </div>
                    <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
