"use client";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ReviewContentTabProps } from "@/components/settings/review-content-tab-props";

export function ReviewContentFeedbackContactSection({ form }: ReviewContentTabProps) {
    return (
        <div className="pt-4 border-t border-border space-y-4">
            <p className="text-sm font-medium text-foreground">Contact fields on private feedback</p>
            <p className="text-xs text-muted-foreground">
                Choose whether customers can leave an email and/or phone, and whether each is optional or required.
            </p>
            <FormField
                control={form.control}
                name="private_feedback_email_mode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="hidden">Hidden</SelectItem>
                                <SelectItem value="optional">Optional</SelectItem>
                                <SelectItem value="required">Required</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            When hidden, the email field is not shown on the public page.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="private_feedback_phone_mode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="hidden">Hidden</SelectItem>
                                <SelectItem value="optional">Optional</SelectItem>
                                <SelectItem value="required">Required</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Collect a callback number when you want to reach customers who left low ratings.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
