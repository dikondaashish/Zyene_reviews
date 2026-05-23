"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ReviewContentTabProps } from "@/components/settings/review-content-tab-props";

export function ReviewContentFeedbackCopyFields({ form }: ReviewContentTabProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="apology_message"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Apology / Heading</FormLabel>
                        <FormControl>
                            <Input placeholder="Sorry about that" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="negative_subheading"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subheading</FormLabel>
                        <FormControl>
                            <Input placeholder="Share your feedback directly with the owner." {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="negative_textarea_placeholder"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Textarea Placeholder</FormLabel>
                        <FormControl>
                            <Input placeholder="Tell us what happened..." {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="negative_button_text"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl>
                            <Input placeholder="Send Feedback" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
