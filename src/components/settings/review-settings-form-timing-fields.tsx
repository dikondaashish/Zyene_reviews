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
import { Input } from "@/components/ui/input";
import type { ReviewSettingsValues } from "./review-settings-form-schema";

export function ReviewSettingsFormTimingFields({ form }: { form: UseFormReturn<ReviewSettingsValues> }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="review_request_delay_minutes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Delay (minutes)</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                        </FormControl>
                        <FormDescription>Time after payment to send request</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="review_request_min_amount_cents"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Min Transaction ($)</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                        </FormControl>
                        <FormDescription>Minimum spend to trigger request</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="review_request_frequency_cap_days"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Frequency Cap (days)</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                        </FormControl>
                        <FormDescription>Example: Don't ask same customer twice in 30 days</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
