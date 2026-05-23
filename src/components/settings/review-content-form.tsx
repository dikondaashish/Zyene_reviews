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
import { createClient } from "@/lib/db/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Upload, Trash, Star, Tag, Globe, MessageSquare, CheckCircle, Palette, Gift } from "lucide-react";
import type { PublicProfilePreviewValues } from "@/types/components";
import { ReviewTagChipEditor } from "@/components/settings/review-tag-chip-editor";
import {
    customTagsForPreview,
    customTagsForSave,
    parseTagsToItems,
    sanitizeTagItems,
    type ReviewTagItem,
} from "@/lib/review-flow/tag-display";

/** Match `businessPatchSchema` max lengths so saves fail in-form instead of opaque API 400s */
const contentSchema = z.object({
    rating_subtitle: z.string().max(500).optional(),
    tags_heading: z.string().max(500).optional(),
    tags_subheading: z.string().max(500).optional(),
    enable_staff_selection: z.boolean().optional(),
    staff_names: z.string().optional(),
    google_heading: z.string().max(500).optional(),
    google_subheading: z.string().max(500).optional(),
    google_button_text: z.string().max(200).optional(),
    negative_subheading: z.string().max(500).optional(),
    negative_textarea_placeholder: z.string().max(500).optional(),
    negative_button_text: z.string().max(200).optional(),
    private_feedback_email_mode: z.enum(["hidden", "optional", "required"]),
    private_feedback_phone_mode: z.enum(["hidden", "optional", "required"]),
    private_feedback_offer_mode: z.enum(["hidden", "visible"]),
    private_feedback_offer_message: z.string().max(500).optional(),
    thank_you_heading: z.string().max(200).optional(),
    thank_you_message: z.string().max(5000).optional(),
    footer_text: z.string().max(200).optional(),
    footer_company_name: z.string().max(200).optional(),
    footer_link: z
        .string()
        .max(2048)
        .optional()
        .refine(
            (s) => !s?.trim() || /^https?:\/\//i.test(s.trim()),
            { message: "Use a full URL starting with http:// or https://" }
        ),
    footer_logo_url: z.string().max(1000).optional(),
    hide_branding: z.boolean().optional(),
    welcome_message: z.string().max(500).optional(),
    apology_message: z.string().max(500).optional(),
    min_stars_for_google: z.number().min(1).max(5).optional(),
    google_review_url: z
        .string()
        .max(2048)
        .optional()
        .refine(
            (s) => !s?.trim() || /^https?:\/\//i.test(s.trim()),
            { message: "Use a full URL starting with http:// or https://" }
        ),
    rating_style: z.enum(["emoji", "stars", "number", "slider", "radio"]).optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

export function ReviewContentForm({
    businessId,
    businessCategory = "other",
    onValuesChange,
    onTabChange,
}: {
    businessId: string;
    businessCategory?: string;
    onValuesChange?: (values: Partial<PublicProfilePreviewValues>) => void;
    onTabChange?: (tab: string) => void;
}) {
    const router = useRouter();
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
            enable_staff_selection: false,
            staff_names: "",
            google_heading: "",
            google_subheading: "",
            google_button_text: "",
            negative_subheading: "",
            negative_textarea_placeholder: "",
            negative_button_text: "",
            private_feedback_email_mode: "optional",
            private_feedback_phone_mode: "hidden",
            private_feedback_offer_mode: "hidden",
            private_feedback_offer_message: "",
            thank_you_heading: "",
            thank_you_message: "",
            footer_text: "",
            footer_company_name: "Zyene",
            footer_link: "https://zyene.com",
            footer_logo_url: "/zyene-footer.png",
            hide_branding: false,
            welcome_message: "",
            apology_message: "",
            rating_style: "emoji",
        },
    });

    const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
    const categoryKey = businessCategory.toLowerCase().trim() || "other";
    const [tagCategory, setTagCategory] = useState(categoryKey);
    const [tagItems, setTagItems] = useState<ReviewTagItem[]>(() =>
        parseTagsToItems(null, categoryKey)
    );
    const [tagsReady, setTagsReady] = useState(false);

    const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size too large (max 2MB)");
            return;
        }

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

    const pushPreview = useCallback(
        (value: Partial<ContentFormValues>) => {
            if (!onValuesChange) return;
            const staffNamesArray = value.staff_names
                ? value.staff_names.split(",").map((t) => t?.trim()).filter((t) => t && t.length > 0)
                : [];

            onValuesChange({
                ...value,
                custom_tags: customTagsForPreview(tagItems, tagCategory),
                staff_names: staffNamesArray,
            });
        },
        [onValuesChange, tagCategory, tagItems]
    );

    useEffect(() => {
        if (!tagsReady) return;
        pushPreview(form.getValues() as ContentFormValues);
    }, [tagItems, tagsReady, pushPreview, form]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (!tagsReady) return;
            pushPreview(value);
        });
        return () => subscription.unsubscribe();
    }, [form, pushPreview, tagsReady]);

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            if (!businessId) return;

            try {
                const { data, error } = await supabase
                    .from("businesses")
                    .select("*")
                    .eq("id", businessId)
                    .single();

                if (error) throw error;

                if (cancelled || !data) return;

                const loadedCategory =
                    typeof data.category === "string" && data.category.trim()
                        ? data.category.trim().toLowerCase()
                        : categoryKey;
                setTagCategory(loadedCategory);
                setTagItems(parseTagsToItems(data.custom_tags, loadedCategory));
                setTagsReady(true);

                form.reset({
                        min_stars_for_google: data.min_stars_for_google ?? 4,
                        rating_subtitle: data.rating_subtitle || "Your feedback means a lot to us!",
                        tags_heading: data.tags_heading || "What did you like most?",
                        tags_subheading: data.tags_subheading || "Tap to select what stood out",
                        enable_staff_selection: data.enable_staff_selection ?? false,
                        staff_names: Array.isArray(data.staff_names) ? data.staff_names.join(", ") : "",
                        google_heading: data.google_heading || "Would you post this on Google?",
                        google_subheading: data.google_subheading || "Tap to edit, or post as-is",
                        google_button_text: data.google_button_text || "Copy & Go to Google",
                        google_review_url: data.google_review_url || "",
                        negative_subheading: data.negative_subheading || "Share your feedback directly with the owner.",
                        negative_textarea_placeholder: data.negative_textarea_placeholder || "Tell us what happened...",
                        negative_button_text: data.negative_button_text || "Send Feedback",
                        private_feedback_email_mode:
                            data.private_feedback_email_mode === "hidden" ||
                            data.private_feedback_email_mode === "optional" ||
                            data.private_feedback_email_mode === "required"
                                ? data.private_feedback_email_mode
                                : "optional",
                        private_feedback_phone_mode:
                            data.private_feedback_phone_mode === "hidden" ||
                            data.private_feedback_phone_mode === "optional" ||
                            data.private_feedback_phone_mode === "required"
                                ? data.private_feedback_phone_mode
                                : "hidden",
                        private_feedback_offer_mode:
                            data.private_feedback_offer_mode === "visible" ? "visible" : "hidden",
                        private_feedback_offer_message: data.private_feedback_offer_message || "",
                        thank_you_heading: data.thank_you_heading || "Thank You!",
                        thank_you_message: data.thank_you_message || "Your feedback means the world to us.\nWe appreciate you taking the time.",

                        footer_text: data.footer_text || "Powered by Zyene",
                        footer_company_name: data.footer_company_name || "Zyene",
                        footer_link: data.footer_link || "",
                        footer_logo_url: data.footer_logo_url || "",
                        hide_branding: data.hide_branding || false,
                        welcome_message: data.welcome_message || "How was your experience?",
                        apology_message: data.apology_message || "Sorry about that",
                        rating_style: (data.rating_style as "emoji" | "stars" | "number" | "slider" | "radio") || "emoji",
                    });
            } catch (error) {
                if (!cancelled) toast.error("Failed to load content settings");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        setIsLoading(true);
        loadData();
        return () => {
            cancelled = true;
        };
    }, [businessId, categoryKey, supabase, form.reset]);

    useEffect(() => {
        if (tagsReady) return;
        setTagItems(parseTagsToItems(null, categoryKey));
        setTagCategory(categoryKey);
    }, [categoryKey, tagsReady]);

    async function onSubmit(data: ContentFormValues) {
        setIsSaving(true);
        try {
            const sanitizedTags = sanitizeTagItems(tagItems);
            if (sanitizedTags.length === 0) {
                toast.error("Add at least one review tag with a label.");
                setIsSaving(false);
                return;
            }

            const staffNamesArray = data.staff_names
                ? data.staff_names.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
                : [];

            const trimOrNull = (s: string | undefined) => {
                const v = s?.trim();
                return v && v.length > 0 ? v : null;
            };

            const patch = {
                welcome_message: trimOrNull(data.welcome_message),
                rating_subtitle: trimOrNull(data.rating_subtitle),
                tags_heading: trimOrNull(data.tags_heading),
                tags_subheading: trimOrNull(data.tags_subheading),
                custom_tags: customTagsForSave(sanitizedTags, tagCategory),
                enable_staff_selection: data.enable_staff_selection ?? false,
                staff_names: staffNamesArray,
                google_heading: trimOrNull(data.google_heading),
                google_subheading: trimOrNull(data.google_subheading),
                google_button_text: trimOrNull(data.google_button_text),
                google_review_url: trimOrNull(data.google_review_url),
                min_stars_for_google: data.min_stars_for_google ?? null,
                apology_message: trimOrNull(data.apology_message),
                negative_subheading: trimOrNull(data.negative_subheading),
                negative_textarea_placeholder: trimOrNull(data.negative_textarea_placeholder),
                negative_button_text: trimOrNull(data.negative_button_text),
                private_feedback_email_mode: data.private_feedback_email_mode,
                private_feedback_phone_mode: data.private_feedback_phone_mode,
                private_feedback_offer_mode: data.private_feedback_offer_mode,
                private_feedback_offer_message: trimOrNull(data.private_feedback_offer_message),
                thank_you_heading: trimOrNull(data.thank_you_heading),
                thank_you_message: trimOrNull(data.thank_you_message),
                footer_text: trimOrNull(data.footer_text),
                footer_company_name: trimOrNull(data.footer_company_name),
                footer_link: trimOrNull(data.footer_link),
                footer_logo_url: trimOrNull(data.footer_logo_url),
                hide_branding: data.hide_branding ?? false,
                rating_style: data.rating_style ?? null,
            };

            const response = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });

            const json = (await response.json().catch(() => ({}))) as {
                success?: boolean;
                error?: string;
                data?: unknown;
            };

            if (!response.ok || json.success !== true) {
                const msg =
                    typeof json.error === "string" && json.error.length > 0
                        ? json.error
                        : "Failed to save content settings";
                throw new Error(msg);
            }

            if (filesToDelete.length > 0) {
                const pathsToDelete = filesToDelete
                    .map((url) => {
                        try {
                            const urlObj = new URL(url);
                            const parts = urlObj.pathname.split("/");
                            return parts[parts.length - 1];
                        } catch {
                            return null;
                        }
                    })
                    .filter((p): p is string => p !== null);

                if (pathsToDelete.length > 0) {
                    await supabase.storage.from("business-logos").remove(pathsToDelete);
                }
                setFilesToDelete([]);
            }

            form.reset(data);
            router.refresh();
            toast.success("Content settings updated successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save content settings");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs
                        defaultValue="rating"
                        className="w-full"
                        onValueChange={onTabChange}
                    >
                        {/* ── Tab Navigation ── */}
                        <div className="border-b bg-muted/40 px-6 pt-5 pb-0">
                            <h3 className="text-lg font-semibold text-foreground mb-1">Review Flow Content</h3>
                            <p className="text-sm text-muted-foreground mb-4">Customize every step of your customer review experience.</p>
                            <TabsList
                                variant="line"
                                className="h-auto w-full min-w-0 justify-start gap-0 overflow-x-auto overflow-y-hidden flex-nowrap no-scrollbar border-0 bg-transparent p-0"
                            >
                                <TabsTrigger value="rating" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <Star className="h-3.5 w-3.5 mr-1.5" />
                                    Rating
                                </TabsTrigger>
                                <TabsTrigger value="tags" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <Tag className="h-3.5 w-3.5 mr-1.5" />
                                    Tags
                                </TabsTrigger>
                                <TabsTrigger value="google" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <Globe className="h-3.5 w-3.5 mr-1.5" />
                                    Review Site
                                </TabsTrigger>
                                <TabsTrigger value="feedback" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                    Feedback
                                </TabsTrigger>
                                <TabsTrigger value="success" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Success
                                </TabsTrigger>
                                <TabsTrigger value="branding" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <Palette className="h-3.5 w-3.5 mr-1.5" />
                                    Branding
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* ── Tab Content ── */}
                        <div className="p-6 space-y-6">
                            {/* Rating Screen Tab */}
                            <TabsContent value="rating" className="space-y-5 mt-0">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground">Rating Screen</h4>
                                    <p className="text-sm text-muted-foreground">The first screen customers see when they open the review link.</p>
                                </div>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="welcome_message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Welcome Heading</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="How was your experience?" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
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
                                                    <Input placeholder="Your feedback means a lot to us!" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-2 border-t border-border">
                                        <FormField
                                            control={form.control}
                                            name="rating_style"
                                            render={({ field }) => (
                                                <FormItem className="mb-4">
                                                    <FormLabel>Rating Style</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                                                                <SelectValue placeholder="Select style" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="emoji">Emoji (😍 😊 😐 😟 😠)</SelectItem>
                                                            <SelectItem value="stars">Stars (★★★★★)</SelectItem>
                                                            <SelectItem value="number">Number Scale (1 - 5)</SelectItem>
                                                            <SelectItem value="slider">Slider (Draggable)</SelectItem>
                                                            <SelectItem value="radio">Radio Buttons (Text-based)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Choose how customers input their rating.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="min_stars_for_google"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Minimum Stars for Public Review</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={String(field.value)}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
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
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Tags Screen Tab */}
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
                                                            <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
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

                            {/* Google Screen Tab */}
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

                            {/* Feedback Screen Tab */}
                            <TabsContent value="feedback" className="space-y-5 mt-0">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground">Negative Feedback</h4>
                                    <p className="text-sm text-muted-foreground">Private feedback form shown for lower ratings (1-3 stars).</p>
                                </div>
                                <div className="space-y-4">
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

                                    <div className="pt-4 border-t border-border space-y-4">
                                        <div className="flex items-start gap-2">
                                            <Gift className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Special offer message</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Optional banner above &quot;Your feedback&quot; — use it to acknowledge the issue and mention a goodwill offer (e.g. discount or follow-up).
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
                                                                placeholder={`We're sorry for the inconvenience. We'd like to make things right with a special offer for you — we'll follow up with the details.`}
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
                                </div>
                            </TabsContent>

                            {/* Success Screen Tab */}
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

                            {/* Branding Screen Tab */}
                            <TabsContent value="branding" className="space-y-5 mt-0">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-foreground">Footer & Branding</h4>
                                    <p className="text-sm text-muted-foreground">Customize the footer appearance.</p>
                                </div>
                                <div className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="footer_company_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Zyene" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormDescription>
                                                    Appears after &quot;Powered by...&quot;.
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
                                                    <Input placeholder="https://zyene.com" {...field} className="bg-muted/30 focus:bg-background transition-colors" />
                                                </FormControl>
                                                <FormDescription>
                                                    Where should the footer link to? Leave blank or use a full URL starting with{" "}
                                                    <span className="font-mono">https://</span> or{" "}
                                                    <span className="font-mono">http://</span>.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Footer Logo Section */}
                                    <div className="space-y-3">
                                        <FormLabel className="text-sm font-medium text-foreground">Footer Logo (Small)</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-12 w-12 rounded-lg border border-border bg-muted/50 overflow-hidden flex items-center justify-center shrink-0">
                                                {uploadingFooterLogo ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                ) : form.watch("footer_logo_url") ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={form.watch("footer_logo_url")!} alt="Footer Logo" className="object-contain h-full w-full p-1" />
                                                ) : (
                                                    <Upload className="h-4 w-4 text-muted-foreground/40" />
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="relative">
                                                    <Button variant="outline" size="sm" type="button" className="relative h-9 px-3 border-border bg-card" disabled={uploadingFooterLogo}>
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
                                                        className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                                        onClick={removeFooterLogo}
                                                        disabled={uploadingFooterLogo}
                                                    >
                                                        <Trash className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Shows between &quot;Powered by&quot; and Company Name. Best size: 64x64px.
                                        </p>
                                    </div>

                                    {/* Hide Branding Toggle */}
                                    <FormField
                                        control={form.control}
                                        name="hide_branding"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium">Hide Branding</FormLabel>
                                                    <FormDescription className="text-xs">
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
                                </div>
                            </TabsContent>
                        </div>

                        {/* ── Save Button ── */}
                        <div className="border-t bg-muted/30 px-6 py-4 flex justify-end items-center gap-4">
                            {form.formState.isDirty && (
                                <span className="text-sm text-chart-4 font-medium hidden sm:inline-block">
                                    Unsaved changes
                                </span>
                            )}
                            <Button
                                type="submit"
                                disabled={isSaving || !form.formState.isDirty}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-10 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
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
        </div>
    );
}
