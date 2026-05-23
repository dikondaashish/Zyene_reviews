"use client";

import type { UseFormReturn } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { NotificationFormFieldHelpTip } from "./notification-form-field-help-tip";
import type { NotificationFormValues } from "./notification-form-schema";

export function NotificationFormEmailFields({ form }: { form: UseFormReturn<NotificationFormValues> }) {
    return (
        <>
            <FormField
                control={form.control}
                name="email_enabled"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-2">
                                <FormLabel className="text-base">Email alerts</FormLabel>
                                <NotificationFormFieldHelpTip label="What email alerts do">
                                    <p>
                                        Sends an email to you <strong>right away</strong> when there is a new public
                                        review or a private feedback alert for <strong>this business</strong>. Your
                                        dashboard always has the full details; this is only the instant heads-up.
                                        Separate from the weekly digest.
                                    </p>
                                </NotificationFormFieldHelpTip>
                            </div>
                            <FormDescription>Receive emails for new reviews.</FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="digest_enabled"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5 pr-2">
                            <div className="flex items-center gap-2">
                                <FormLabel className="text-base">Weekly digest</FormLabel>
                                <NotificationFormFieldHelpTip label="What the weekly digest is">
                                    <p>
                                        One summary email (usually Monday morning) with new reviews from the{" "}
                                        <strong>last 7 days</strong> and a short snapshot for this business. You can
                                        keep this on while turning off instant email alerts, or the other way
                                        around—they work independently.
                                    </p>
                                </NotificationFormFieldHelpTip>
                            </div>
                            <FormDescription>
                                Get a weekly email with new reviews from the past seven days (typically sent Monday
                                mornings).
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </>
    );
}
