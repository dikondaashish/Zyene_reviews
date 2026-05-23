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

export function ReviewContentSuccessTab({ form }: ReviewContentTabProps) {
    return (
                            <TabsContent value="success" className="space-y-5 mt-0">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground">Success / Thank You</h4>
                                    <p className="text-sm text-muted-foreground">Final screen shown after completion.</p>
                                </div>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="thank_you_heading"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Heading</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Thank You!" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="thank_you_message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message Body</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Your feedback means the world to us."
                                                        className="min-h-[80px] bg-muted/30 focus:bg-background transition-colors resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>
    );
}
