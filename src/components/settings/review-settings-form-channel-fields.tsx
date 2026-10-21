"use client";

import type { UseFormReturn } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import type { ReviewSettingsValues } from "./review-settings-form-schema";

export function ReviewSettingsFormChannelFields({ form }: { form: UseFormReturn<ReviewSettingsValues> }) {
    return (
        <div className="flex flex-col gap-4">
            <FormLabel>Channels</FormLabel>
            <FormField
                control={form.control}
                name="review_request_sms_enabled"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>SMS Requests</FormLabel>
                            <FormDescription>
                                Send review requests by text. Turning this off also stops texts already queued
                                (scheduled requests and campaign reminders); they are skipped with a reason.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="review_request_email_enabled"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Email Requests</FormLabel>
                            <FormDescription>
                                Send review requests by email. Turning this off also stops queued emails.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
}
