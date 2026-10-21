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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { ReviewSettingsValues } from "./review-settings-form-schema";

/** Customer quiet hours: messages that would go out inside the window wait until it ends. */
export function ReviewSettingsFormQuietHoursFields({
    form,
    timezone,
}: {
    form: UseFormReturn<ReviewSettingsValues>;
    timezone: string | null;
}) {
    const enabled = form.watch("review_request_quiet_hours_enabled");
    return (
        <div className="flex flex-col gap-4 rounded-md border p-4">
            <FormField
                control={form.control}
                name="review_request_quiet_hours_enabled"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Quiet hours for customers</FormLabel>
                            <FormDescription>
                                Review requests and reminders that would go out in this window wait until it ends,
                                in your business timezone ({timezone || "UTC"}, daylight saving included). This also
                                applies to messages already queued.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />
            {enabled && (
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                    <FormField
                        control={form.control}
                        name="review_request_quiet_start"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Don&apos;t send after</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="review_request_quiet_end"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resume at</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    );
}
