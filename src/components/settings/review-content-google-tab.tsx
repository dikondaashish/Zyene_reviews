"use client";


import { TabsContent } from "@/components/ui/tabs";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ReviewContentTabProps } from "@/components/settings/review-content-tab-props";

export function ReviewContentGoogleTab({ form }: ReviewContentTabProps) {
    return (
                            <TabsContent value="google" className="space-y-5 mt-0">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground">Public Review Request</h4>
                                    <p className="text-sm text-muted-foreground">Screen encouraging users to post their review on your chosen platform.</p>
                                </div>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="google_heading"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Heading</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Would you post this on Google?" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="google_subheading"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subheading</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tap to edit, or post as-is" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="google_button_text"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Button Text</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Copy & Go to Google" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="google_review_url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Custom Review Site Link</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://g.page/r/..." {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormDescription>
                                                    Optional: Override the default Review Site link. If you enter a URL, it must start
                                                    with{" "}
                                                    <span className="font-mono">https://</span> or{" "}
                                                    <span className="font-mono">http://</span> or saving will fail validation.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>
    );
}
