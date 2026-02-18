"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

const contentSchema = z.object({
    rating_subtitle: z.string().optional(),
    tags_heading: z.string().optional(),
    tags_subheading: z.string().optional(),
    custom_tags: z.string().optional(), // Comma-separated string for easier editing
    google_heading: z.string().optional(),
    google_subheading: z.string().optional(),
    google_button_text: z.string().optional(),
    negative_subheading: z.string().optional(),
    negative_textarea_placeholder: z.string().optional(),
    negative_button_text: z.string().optional(),
    thank_you_heading: z.string().optional(),
    thank_you_message: z.string().optional(),
    footer_text: z.string().optional(),
    hide_branding: z.boolean().optional(),
    welcome_message: z.string().optional(),
    apology_message: z.string().optional(),
    min_stars_for_google: z.number().min(1).max(5).optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

export function ReviewContentForm({ businessId, onValuesChange }: { businessId: string; onValuesChange?: (values: any) => void }) {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ContentFormValues>({
        resolver: zodResolver(contentSchema),
        defaultValues: {
            min_stars_for_google: 4,
            rating_subtitle: "",
            tags_heading: "",
            tags_subheading: "",
            custom_tags: "",
            google_heading: "",
            google_subheading: "",
            google_button_text: "",
            negative_subheading: "",
            negative_textarea_placeholder: "",
            negative_button_text: "",
            thank_you_heading: "",
            thank_you_message: "",
            footer_text: "",
            hide_branding: false,
            welcome_message: "",
            apology_message: "",
        },
    });

    // Watch for changes and notify parent for preview
    useEffect(() => {
        const subscription = form.watch((value) => {
            if (onValuesChange) {
                // Parse custom tags for preview
                const customTagsArray = value.custom_tags
                    ? value.custom_tags.split(",").map((t) => t?.trim()).filter((t) => t && t.length > 0)
                    : [];

                onValuesChange({
                    ...value,
                    custom_tags: customTagsArray
                });
            }
        });
        return () => subscription.unsubscribe();
    }, [form.watch, onValuesChange]);

    useEffect(() => {
        async function loadData() {
            if (!businessId) return;

            try {
                const { data, error } = await supabase
                    .from("businesses")
                    .select("*")
                    .eq("id", businessId)
                    .single();

                if (error) throw error;

                if (data) {
                    form.reset({
                        rating_subtitle: data.rating_subtitle || "Your feedback means a lot to us!",
                        tags_heading: data.tags_heading || "What did you like most?",
                        tags_subheading: data.tags_subheading || "Tap to select what stood out",
                        custom_tags: Array.isArray(data.custom_tags) ? data.custom_tags.join(", ") : "",
                        google_heading: data.google_heading || "Would you post this on Google?",
                        google_subheading: data.google_subheading || "Tap to edit, or post as-is",
                        google_button_text: data.google_button_text || "Copy & Go to Google",
                        negative_subheading: data.negative_subheading || "Share your feedback directly with the owner.",
                        negative_textarea_placeholder: data.negative_textarea_placeholder || "Tell us what happened...",
                        negative_button_text: data.negative_button_text || "Send Feedback",
                        thank_you_heading: data.thank_you_heading || "Thank You!",
                        thank_you_message: data.thank_you_message || "Your feedback means the world to us.\nWe appreciate you taking the time.",
                        footer_text: data.footer_text || "Powered by Zyene",
                        hide_branding: data.hide_branding || false,
                        welcome_message: data.welcome_message || "How was your experience?",
                        apology_message: data.apology_message || "Sorry about that",
                    });
                }
            } catch (error) {
                console.error("Error loading content settings:", error);
                toast.error("Failed to load content settings");
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [businessId, supabase, form]);

    async function onSubmit(data: ContentFormValues) {
        setIsSaving(true);
        try {
            // Process custom tags string back to array
            const customTagsArray = data.custom_tags
                ? data.custom_tags.split(",").map(t => t.trim()).filter(t => t.length > 0)
                : null;

            const updateData = {
                ...data,
                custom_tags: customTagsArray,
            };

            const { error } = await supabase
                .from("businesses")
                .update(updateData)
                .eq("id", businessId);

            if (error) throw error;

            toast.success("Content settings updated successfully");
        } catch (error) {
            console.error("Error saving content settings:", error);
            toast.error("Failed to save content settings");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="rating" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
                        <TabsTrigger value="rating" className="py-2">Rating</TabsTrigger>
                        <TabsTrigger value="tags" className="py-2">Tags</TabsTrigger>
                        <TabsTrigger value="google" className="py-2">Google</TabsTrigger>
                        <TabsTrigger value="feedback" className="py-2">Feedback</TabsTrigger>
                        <TabsTrigger value="success" className="py-2">Success</TabsTrigger>
                        <TabsTrigger value="branding" className="py-2">Branding</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-4 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                        {/* Rating Screen Tab */}
                        <TabsContent value="rating" className="space-y-4 mt-0">
                            <div className="space-y-1 mb-4">
                                <h3 className="font-semibold text-slate-900">Rating Screen</h3>
                                <p className="text-sm text-slate-500">The first screen customers see when they open the review link.</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="welcome_message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Welcome Heading</FormLabel>
                                        <FormControl>
                                            <Input placeholder="How was your experience?" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rating_subtitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subtitle</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your feedback means a lot to us!" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="min_stars_for_google"
                                render={({ field }) => (
                                    <FormItem className="pt-2 border-t mt-4">
                                        <FormLabel>Minimum Stars for Public Review</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={String(field.value)}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select stars" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">1 Star & Up</SelectItem>
                                                <SelectItem value="2">2 Stars & Up</SelectItem>
                                                <SelectItem value="3">3 Stars & Up</SelectItem>
                                                <SelectItem value="4">4 Stars & Up (Recommended)</SelectItem>
                                                <SelectItem value="5">5 Stars Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            {form.watch("min_stars_for_google") === 1
                                                ? "All ratings will be directed to public review flow."
                                                : "Customers rating below this threshold will be asked for private feedback instead."}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>

                        {/* Tags Screen Tab */}
                        <TabsContent value="tags" className="space-y-4 mt-0">
                            <div className="space-y-1 mb-4">
                                <h3 className="font-semibold text-slate-900">Tags Selection</h3>
                                <p className="text-sm text-slate-500">Screen shown after a positive rating (4-5 stars).</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="tags_heading"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Heading</FormLabel>
                                        <FormControl>
                                            <Input placeholder="What did you like most?" {...field} />
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
                                            <Input placeholder="Tap to select what stood out" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="custom_tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custom Tags (Comma Separted)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Professional, Friendly, Fast Service, Great Value"
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Leave empty to use default tags for your business category. Separate multiple tags with commas.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>

                        {/* Google Screen Tab */}
                        <TabsContent value="google" className="space-y-4 mt-0">
                            <div className="space-y-1 mb-4">
                                <h3 className="font-semibold text-slate-900">Google Review Prompt</h3>
                                <p className="text-sm text-slate-500">Screen encouraging users to post their AI-generated review.</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="google_heading"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Heading</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Would you post this on Google?" {...field} />
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
                                            <Input placeholder="Tap to edit, or post as-is" {...field} />
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
                                            <Input placeholder="Copy & Go to Google" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>

                        {/* Feedback Screen Tab */}
                        <TabsContent value="feedback" className="space-y-4 mt-0">
                            <div className="space-y-1 mb-4">
                                <h3 className="font-semibold text-slate-900">Negative Feedback</h3>
                                <p className="text-sm text-slate-500">Private feedback form shown for lower ratings (1-3 stars).</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="apology_message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apology / Heading</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Sorry about that" {...field} />
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
                                            <Input placeholder="Share your feedback directly with the owner." {...field} />
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
                                            <Input placeholder="Tell us what happened..." {...field} />
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
                                            <Input placeholder="Send Feedback" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>

                        {/* Success Screen Tab */}
                        <TabsContent value="success" className="space-y-4 mt-0">
                            <div className="space-y-1 mb-4">
                                <h3 className="font-semibold text-slate-900">Success / Thank You</h3>
                                <p className="text-sm text-slate-500">Final screen shown after completion.</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="thank_you_heading"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Heading</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Thank You!" {...field} />
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
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>

                        {/* Branding Screen Tab */}
                        <TabsContent value="branding" className="space-y-4 mt-0">
                            <div className="space-y-1 mb-4">
                                <h3 className="font-semibold text-slate-900">Footer & Branding</h3>
                                <p className="text-sm text-slate-500">Customize the footer appearance.</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="footer_text"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Footer Text</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Powered by Zyene" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Defaults to "Powered by Zyene".
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hide_branding"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Hide Branding</FormLabel>
                                            <FormDescription>
                                                Hide the footer completely from the review flow.
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
                        </TabsContent>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving} className="min-w-[120px]">
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </Tabs>
            </form>
        </Form>
    );
}
