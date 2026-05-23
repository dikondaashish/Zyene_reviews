"use client";

import { Gift } from "lucide-react";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ReviewContentTabProps } from "@/components/settings/review-content-tab-props";

export function ReviewContentFeedbackOfferSection({ form }: ReviewContentTabProps) {
    return (
        <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-start gap-2">
                <Gift className="text-primary shrink-0 mt-0.5 size-4" />
                <div>
                    <p className="text-sm font-medium text-foreground">Special offer message</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Optional banner above &quot;Your feedback&quot; ,  use it to acknowledge the issue and mention a goodwill offer (e.g. discount or follow-up).
                    </p>
                </div>
            </div>
            <FormField
                control={form.control}
                name="private_feedback_offer_mode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Banner</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="hidden">Hidden</SelectItem>
                                <SelectItem value="visible">Show</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            When shown, customers see this before they write their feedback.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {form.watch("private_feedback_offer_mode") === "visible" && (
                <FormField
                    control={form.control}
                    name="private_feedback_offer_message"
                    render={({ field }) => (
                        <FormItem className="animate-in fade-in slide-in-from-top-1 duration-200">
                            <FormLabel>Custom message (optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={`We're sorry for the inconvenience. We'd like to make things right with a special offer for you, we'll follow up with the details.`}
                                    className="min-h-[100px] bg-muted/30 focus:bg-background transition-colors resize-none text-sm"
                                    maxLength={500}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Leave blank to use the default wording. Max 500 characters.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
}
