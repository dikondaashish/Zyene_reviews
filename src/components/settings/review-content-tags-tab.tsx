"use client";

import { Star } from "lucide-react";
import { ReviewTagChipEditor } from "@/components/settings/review-tag-chip-editor";
import type { ReviewTagItem } from "@/lib/review-flow/tag-display";

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
import type { ReviewContentTagsTabProps } from "@/components/settings/review-content-tab-props";

export function ReviewContentTagsTab({
    form,
    tagCategory,
    tagItems,
    tagsReady,
    setTagItems,
}: ReviewContentTagsTabProps) {
    return (
                            <TabsContent value="tags" className="space-y-5 mt-0">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground">Tags Selection</h4>
                                    <p className="text-sm text-muted-foreground">Screen shown after a positive rating (4-5 stars).</p>
                                </div>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="tags_heading"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Heading</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="What did you like most?" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tags_subheading"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subheading</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tap to select what stood out" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormItem>
                                        <FormLabel>Review tags</FormLabel>
                                        {tagsReady ? (
                                            <ReviewTagChipEditor
                                                category={tagCategory}
                                                items={tagItems}
                                                onChange={setTagItems}
                                            />
                                        ) : (
                                            <div className="h-24 rounded-lg border border-border bg-muted/20 animate-pulse" />
                                        )}
                                        <FormDescription>
                                            Starts from your business category defaults. Icons appear on your review page automatically. Reset to restore defaults.
                                        </FormDescription>
                                    </FormItem>
                                    <div className="pt-4 border-t border-border mt-4">
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="enable_staff_selection"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/10">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-base font-semibold text-foreground">
                                                                Enable Staff Selection
                                                            </FormLabel>
                                                            <FormDescription className="text-muted-foreground">
                                                                Allow customers to select which staff members helped them.
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {form.watch("enable_staff_selection") && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                    <FormField
                                                        control={form.control}
                                                        name="staff_names"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Staff Names (Comma Separated)</FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="John, Emily, David, Sarah"
                                                                        className="min-h-[80px] bg-muted/30 focus:bg-background transition-colors resize-none"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormDescription>
                                                                    List the staff members you want to appear in the review flow. Separate names with commas.
                                                                </FormDescription>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    
                                                    {!form.watch("staff_names") && (
                                                        <div className="p-3 bg-primary/10 rounded-md border border-primary/20 flex gap-3">
                                                            <Star className="text-primary shrink-0 mt-0.5 size-4" />
                                                            <p className="text-xs text-primary">
                                                                <strong>Note:</strong> Staff selection will only appear in the review flow if you add at least one name above.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
    );
}
