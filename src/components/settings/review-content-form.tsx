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
import { useState, useEffect, useRef } from "react";
import { Loader2, Save, Upload, Trash } from "lucide-react";

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
    footer_text: z.string().optional(), // Deprecated but kept for backward compatibility if needed, though we will hide it
    footer_company_name: z.string().optional(),
    footer_link: z.string().optional(),
    footer_logo_url: z.string().optional(),
    hide_branding: z.boolean().optional(),
    welcome_message: z.string().optional(),
    apology_message: z.string().optional(),
    min_stars_for_google: z.number().min(1).max(5).optional(),
    google_review_url: z.string().optional(),
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
            google_review_url: "",
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
            footer_company_name: "Zyene",
            footer_link: "https://zyene.com",
            footer_logo_url: "/zyene-footer.png",
            hide_branding: false,
            welcome_message: "",
            apology_message: "",
        },
    });

    const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

    const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size too large (max 2MB)");
            return;
        }

        // Mark existing logo for deletion if it's a hosted file and not the default local asset
        const currentLogo = form.getValues("footer_logo_url");
        if (currentLogo && currentLogo.includes("supabase.co") && !currentLogo.includes("/zyene-footer.png")) {
            setFilesToDelete(prev => [...prev, currentLogo]);
        }

        setUploadingFooterLogo(true);
        try {
            const fileName = `footer-${businessId}-${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from("business-logos").upload(fileName, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from("business-logos").getPublicUrl(fileName);
            form.setValue("footer_logo_url", publicUrl, { shouldDirty: true, shouldTouch: true });
            toast.success("Footer logo uploaded!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload logo");
        } finally {
            setUploadingFooterLogo(false);
        }
    };

    const removeFooterLogo = () => {
        const currentLogo = form.getValues("footer_logo_url");
        if (currentLogo && currentLogo.includes("supabase.co") && !currentLogo.includes("/zyene-footer.png")) {
            setFilesToDelete(prev => [...prev, currentLogo]);
        }
        form.setValue("footer_logo_url", "", { shouldDirty: true, shouldTouch: true });
        toast.success("Footer logo removed");
    };

    // Watch for changes and notify parent for preview
    const onValuesChangeRef = useRef(onValuesChange);
    onValuesChangeRef.current = onValuesChange;

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (onValuesChangeRef.current) {
                // Parse custom tags for preview
                const customTagsArray = value.custom_tags
                    ? value.custom_tags.split(",").map((t) => t?.trim()).filter((t) => t && t.length > 0)
                    : [];

                onValuesChangeRef.current({
                    ...value,
                    custom_tags: customTagsArray
                });
            }
        });
        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form]);

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
                        google_review_url: data.google_review_url || "",
                        negative_subheading: data.negative_subheading || "Share your feedback directly with the owner.",
                        negative_textarea_placeholder: data.negative_textarea_placeholder || "Tell us what happened...",
                        negative_button_text: data.negative_button_text || "Send Feedback",
                        thank_you_heading: data.thank_you_heading || "Thank You!",
                        thank_you_message: data.thank_you_message || "Your feedback means the world to us.\nWe appreciate you taking the time.",

                        footer_text: data.footer_text || "Powered by Zyene",
                        footer_company_name: data.footer_company_name || "Zyene",
                        footer_link: data.footer_link || "",
                        footer_logo_url: data.footer_logo_url || "",
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

            // Delete marked files from storage
            if (filesToDelete.length > 0) {
                const pathsToDelete = filesToDelete.map(url => {
                    try {
                        const urlObj = new URL(url);
                        const parts = urlObj.pathname.split('/');
                        return parts[parts.length - 1]; // Last part is filename
                    } catch (e) {
                        return null;
                    }
                }).filter(p => p !== null) as string[];

                if (pathsToDelete.length > 0) {
                    await supabase.storage.from("business-logos").remove(pathsToDelete);
                }
                setFilesToDelete([]);
            }

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
                        <TabsTrigger value="google" className="py-2">Review Site</TabsTrigger>
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
                                <h3 className="font-semibold text-slate-900">Public Review Request</h3>
                                <p className="text-sm text-slate-500">Screen encouraging users to post their review on your chosen platform.</p>
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
                            <FormField
                                control={form.control}
                                name="google_review_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custom Review Site Link</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://g.page/r/..." {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Optional: Override the default Review Site link.
                                        </FormDescription>
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
                                name="footer_company_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Zyene" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Appears after "Powered by...".
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="footer_link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://zyene.com" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Where should the footer link to?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-4">
                                <FormLabel className="text-base font-medium text-slate-900">Footer Logo (Small)</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="relative h-12 w-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                                        {uploadingFooterLogo ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                        ) : form.watch("footer_logo_url") ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={form.watch("footer_logo_url")!} alt="Footer Logo" className="object-contain h-full w-full p-1" />
                                        ) : (
                                            <Upload className="h-4 w-4 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Button variant="outline" size="sm" type="button" className="relative h-9 px-3 border-slate-200 bg-white" disabled={uploadingFooterLogo}>
                                                <Upload className="mr-2 h-3.5 w-3.5" />
                                                Upload
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                    accept="image/png, image/jpeg, image/webp"
                                                    onChange={handleFooterLogoUpload}
                                                    disabled={uploadingFooterLogo}
                                                />
                                            </Button>
                                        </div>
                                        {form.watch("footer_logo_url") && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={removeFooterLogo}
                                                disabled={uploadingFooterLogo}
                                            >
                                                <Trash className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Shows between "Powered by" and Company Name. Best size: 64x64px.
                                </p>
                            </div>
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
