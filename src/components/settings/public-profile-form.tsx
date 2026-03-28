"use client";

import { useState, useEffect, useCallback } from "react";
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
import { 
    Loader2, 
    Save, 
    Upload, 
    Check, 
    X, 
    AlertTriangle,
    Globe,
    Palette,
    Star,
    Tag,
    Share2,
    MessageSquare,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import { sanitizeSlug } from "@/lib/utils/index";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/lib/language-context";

const profileSchema = z.object({
    slug: z.string()
        .min(3, { message: "Slug must be at least 3 characters." })
        .regex(/^[a-z0-9-]+$/, { message: "Only lowercase letters, numbers, and hyphens." }),
    brand_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code."),
    logo_url: z.string().optional().nullable(),
    welcome_message: z.string().optional(),
    rating_subtitle: z.string().optional(),
    min_stars_for_google: z.number().min(1).max(5).optional(),
    tags_heading: z.string().optional(),
    tags_subheading: z.string().optional(),
    custom_tags: z.string().optional(),
    google_heading: z.string().optional(),
    google_subheading: z.string().optional(),
    google_button_text: z.string().optional(),
    google_review_url: z.string().optional(),
    apology_message: z.string().optional(),
    negative_subheading: z.string().optional(),
    negative_textarea_placeholder: z.string().optional(),
    negative_button_text: z.string().optional(),
    thank_you_heading: z.string().optional(),
    thank_you_message: z.string().optional(),
    footer_company_name: z.string().optional(),
    footer_link: z.string().optional(),
    footer_logo_url: z.string().optional().nullable(),
    hide_branding: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface PublicProfileFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    business: any;
    onValuesChange?: (values: any) => void;
}

export function PublicProfileForm({ business, onValuesChange }: PublicProfileFormProps) {
    const { dict } = useLanguage();
    const router = useRouter();
    const supabase = createClient();
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);
    const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
    const [showSlugWarning, setShowSlugWarning] = useState(false);
    const [pendingSlug, setPendingSlug] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            slug: business.slug || "",
            brand_color: business.brand_color || "#0f172a",
            logo_url: business.logo_url || null,
            welcome_message: business.welcome_message || dict.public_profile.rating.welcome,
            rating_subtitle: business.rating_subtitle || dict.public_profile.rating.subtitle,
            min_stars_for_google: business.min_stars_for_google || 4,
            tags_heading: business.tags_heading || dict.public_profile.tags.heading,
            tags_subheading: business.tags_subheading || dict.public_profile.tags.subheading,
            custom_tags: Array.isArray(business.custom_tags) ? business.custom_tags.join(", ") : "",
            google_heading: business.google_heading || dict.public_profile.review_site.heading,
            google_subheading: business.google_subheading || dict.public_profile.review_site.subheading,
            google_button_text: business.google_button_text || dict.public_profile.review_site.button_text,
            google_review_url: business.google_review_url || "",
            apology_message: business.apology_message || dict.public_profile.feedback.apology,
            negative_subheading: business.negative_subheading || dict.public_profile.feedback.subheading,
            negative_textarea_placeholder: business.negative_textarea_placeholder || dict.public_profile.feedback.placeholder,
            negative_button_text: business.negative_button_text || dict.public_profile.feedback.button_text,
            thank_you_heading: business.thank_you_heading || dict.public_profile.success.heading,
            thank_you_message: business.thank_you_message || dict.public_profile.success.message,
            footer_company_name: business.footer_company_name || "Zyene",
            footer_link: business.footer_link || "",
            footer_logo_url: business.footer_logo_url || null,
            hide_branding: business.hide_branding || false,
        },
    });

    const watchedAll = form.watch();
    const watchedSlug = form.watch("slug");

    useEffect(() => {
        const customTagsArray = watchedAll.custom_tags
            ? watchedAll.custom_tags.split(",").map((t) => t?.trim()).filter((t) => t && t.length > 0)
            : [];
            
        onValuesChange?.({
            ...watchedAll,
            custom_tags: customTagsArray
        });
    }, [watchedAll, onValuesChange]);

    useEffect(() => {
        if (!watchedSlug || watchedSlug === business.slug) {
            setIsSlugAvailable(null);
            return;
        }

        if (watchedSlug.length < 3) return;

        const timer = setTimeout(async () => {
            setIsCheckingSlug(true);
            try {
                const res = await fetch(`/api/businesses/check-slug?slug=${watchedSlug}&businessId=${business.id}`);
                const data = await res.json();
                setIsSlugAvailable(data.available);
                if (!data.available) {
                    form.setError("slug", { message: dict.public_profile.link.already_taken });
                } else {
                    form.clearErrors("slug");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsCheckingSlug(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [watchedSlug, business.id, business.slug, form, dict.public_profile.link.already_taken]);

    const uploadImage = async (file: File, type: "logo" | "footer") => {
        if (file.size > 2 * 1024 * 1024) {
            toast.error(dict.public_profile.file_too_large);
            return;
        }

        const setter = type === "logo" ? setUploadingLogo : () => {};
        const field = type === "logo" ? "logo_url" : "footer_logo_url";
        
        setter(true);
        try {
            const fileName = `${type}-${business.id}-${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from("business-logos").upload(fileName, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from("business-logos").getPublicUrl(fileName);
            form.setValue(field, publicUrl, { shouldDirty: true, shouldTouch: true });
            toast.success(dict.public_profile.upload_success);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(dict.public_profile.upload_error);
        } finally {
            setter(false);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        if (data.slug !== business.slug && showSlugWarning === false) {
            setPendingSlug(data.slug);
            setShowSlugWarning(true);
            return;
        }

        setIsSaving(true);
        try {
            const customTagsArray = data.custom_tags
                ? data.custom_tags.split(",").map(t => t.trim()).filter(t => t.length > 0)
                : null;

            const { error } = await supabase
                .from("businesses")
                .update({
                    ...data,
                    custom_tags: customTagsArray,
                })
                .eq("id", business.id);

            if (error) throw error;

            toast.success(dict.public_profile.save_success);
            router.refresh();
        } catch (error) {
            console.error("Save error:", error);
            toast.error(dict.public_profile.save_error);
        } finally {
            setIsSaving(false);
            setShowSlugWarning(false);
            setPendingSlug(null);
        }
    };

    return (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                    <Tabs defaultValue="link" className="w-full">
                        <div className="border-b bg-slate-50/50 overflow-x-auto no-scrollbar">
                            <TabsList className="flex h-auto w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                                <TabsTrigger value="link" className="tab-trigger">
                                    <Globe className="h-4 w-4 mr-2" />
                                    {dict.public_profile.tabs.link}
                                </TabsTrigger>
                                <TabsTrigger value="branding" className="tab-trigger">
                                    <Palette className="h-4 w-4 mr-2" />
                                    {dict.public_profile.tabs.branding}
                                </TabsTrigger>
                                <TabsTrigger value="rating" className="tab-trigger">
                                    <Star className="h-4 w-4 mr-2" />
                                    {dict.public_profile.tabs.rating}
                                </TabsTrigger>
                                <TabsTrigger value="tags" className="tab-trigger">
                                    <Tag className="h-4 w-4 mr-2" />
                                    {dict.public_profile.tabs.tags}
                                </TabsTrigger>
                                <TabsTrigger value="review" className="tab-trigger">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    {dict.public_profile.tabs.review_site}
                                </TabsTrigger>
                                <TabsTrigger value="feedback" className="tab-trigger">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    {dict.public_profile.tabs.feedback}
                                </TabsTrigger>
                                <TabsTrigger value="success" className="tab-trigger">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {dict.public_profile.tabs.success}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-8">
                            <TabsContent value="link" className="tab-content">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">{dict.public_profile.link.title}</h3>
                                        <p className="text-sm text-slate-500 mt-1">{dict.public_profile.link.desc}</p>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem className="max-w-xl">
                                                <FormLabel>{dict.public_profile.link.label}</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center group">
                                                        <div className="px-4 h-11 flex items-center bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm font-medium select-none">
                                                            zyenereviews.com/
                                                        </div>
                                                        <div className="relative flex-1">
                                                            <Input
                                                                {...field}
                                                                className="rounded-l-none rounded-r-xl h-11 border-slate-200 focus:bg-white transition-all pr-10"
                                                                placeholder={dict.public_profile.link.placeholder}
                                                                onChange={(e) => field.onChange(sanitizeSlug(e.target.value))}
                                                            />
                                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                                {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                                                                {!isCheckingSlug && isSlugAvailable === true && <Check className="h-4 w-4 text-emerald-500" />}
                                                                {!isCheckingSlug && isSlugAvailable === false && <X className="h-4 w-4 text-rose-500" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormDescription>{dict.public_profile.link.hint}</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="branding" className="tab-content">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">{dict.public_profile.branding.title}</h3>
                                        <p className="text-sm text-slate-500 mt-1">{dict.public_profile.branding.desc}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <FormLabel>{dict.public_profile.branding.logo_label}</FormLabel>
                                            <div className="flex items-center gap-6">
                                                <div className="h-24 w-24 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                    {uploadingLogo ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : 
                                                     watchedAll.logo_url ? <img src={watchedAll.logo_url} className="h-full w-full object-contain p-2" alt="Logo" /> : 
                                                     <Upload className="h-5 w-5 text-slate-300" />}
                                                </div>
                                                <div className="space-y-2">
                                                    <Button variant="outline" size="sm" type="button" className="relative group overflow-hidden">
                                                        <Upload className="h-3.5 w-3.5 mr-2" /> {dict.public_profile.branding.upload}
                                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "logo")} />
                                                    </Button>
                                                    <p className="text-xs text-slate-400">{dict.public_profile.branding.max_size}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="brand_color"
                                            render={({ field }) => (
                                                <FormItem className="space-y-4">
                                                    <FormLabel>{dict.public_profile.branding.color_label}</FormLabel>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-11 w-11 rounded-xl border-2 border-slate-100 shadow-sm overflow-hidden shrink-0 cursor-pointer relative ring-offset-2 focus-within:ring-2 ring-blue-500" style={{ backgroundColor: field.value }}>
                                                            <input type="color" {...field} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                        </div>
                                                        <Input {...field} className="font-mono h-11 max-w-[140px] uppercase" />
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="pt-8 border-t space-y-6">
                                        <h4 className="font-medium text-slate-900">{dict.public_profile.branding.footer_title}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormField control={form.control} name="footer_company_name" render={({ field }) => (
                                                <FormItem><FormLabel>{dict.public_profile.branding.footer_name}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name="footer_link" render={({ field }) => (
                                                <FormItem><FormLabel>{dict.public_profile.branding.footer_link}</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="hide_branding" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-xl border p-4">
                                                <div className="space-y-0.5"><FormLabel>{dict.public_profile.branding.hide_branding}</FormLabel><FormDescription>{dict.public_profile.branding.hide_branding_desc}</FormDescription></div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="rating" className="tab-content">
                                <div className="space-y-6">
                                    <div className="space-y-4 max-w-2xl">
                                        <FormField control={form.control} name="welcome_message" render={({ field }) => (
                                            <FormItem><FormLabel>{dict.public_profile.rating.welcome}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="rating_subtitle" render={({ field }) => (
                                            <FormItem><FormLabel>{dict.public_profile.rating.subtitle}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                        )} />
                                        <FormField control={form.control} name="min_stars_for_google" render={({ field }) => (
                                            <FormItem className="pt-4 border-t">
                                                <FormLabel>{dict.public_profile.rating.threshold_label}</FormLabel>
                                                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="1">{dict.public_profile.rating.threshold_options["1"]}</SelectItem>
                                                        <SelectItem value="3">{dict.public_profile.rating.threshold_options["3"]}</SelectItem>
                                                        <SelectItem value="4">{dict.public_profile.rating.threshold_options["4"]}</SelectItem>
                                                        <SelectItem value="5">{dict.public_profile.rating.threshold_options["5"]}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>{dict.public_profile.rating.threshold_desc}</FormDescription>
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="tags" className="tab-content">
                                <div className="space-y-6 max-w-2xl">
                                    <FormField control={form.control} name="tags_heading" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.tags.heading}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="tags_subheading" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.tags.subheading}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="custom_tags" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{dict.public_profile.tags.custom_tags_label}</FormLabel>
                                            <FormControl><Textarea className="min-h-[100px]" placeholder={dict.public_profile.tags.custom_tags_placeholder} {...field} /></FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </TabsContent>

                            <TabsContent value="review" className="tab-content">
                                <div className="space-y-6 max-w-2xl">
                                    <FormField control={form.control} name="google_heading" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.review_site.heading}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="google_subheading" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.review_site.subheading}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="google_button_text" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.review_site.button_text}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="google_review_url" render={({ field }) => (
                                        <FormItem className="pt-4 border-t"><FormLabel>{dict.public_profile.review_site.custom_url}</FormLabel><FormControl><Input {...field} placeholder="https://g.page/r/..." /></FormControl><FormDescription>{dict.public_profile.review_site.custom_url_desc}</FormDescription></FormItem>
                                    )} />
                                </div>
                            </TabsContent>

                            <TabsContent value="feedback" className="tab-content">
                                <div className="space-y-6 max-w-2xl">
                                    <FormField control={form.control} name="apology_message" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.feedback.apology}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="negative_subheading" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.feedback.subheading}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="negative_textarea_placeholder" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.feedback.placeholder}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="negative_button_text" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.feedback.button_text}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                </div>
                            </TabsContent>

                            <TabsContent value="success" className="tab-content">
                                <div className="space-y-6 max-w-2xl">
                                    <FormField control={form.control} name="thank_you_heading" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.success.heading}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="thank_you_message" render={({ field }) => (
                                        <FormItem><FormLabel>{dict.public_profile.success.message}</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl></FormItem>
                                    )} />
                                </div>
                            </TabsContent>
                        </div>

                        <div className="border-t bg-slate-50/50 p-6 flex items-center justify-between">
                            <p className="text-sm text-slate-500 font-medium">{dict.public_profile.section_hint}</p>
                            <Button type="submit" disabled={isSaving} className="min-w-[140px] h-11 bg-slate-900 rounded-xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {dict.public_profile.save_settings}
                            </Button>
                        </div>
                    </Tabs>
                </form>
            </Form>

            <AlertDialog open={showSlugWarning} onOpenChange={setShowSlugWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            {dict.public_profile.link.warning_title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dict.public_profile.link.warning_desc
                                .replace("%new_url%", `zyenereviews.com/${pendingSlug}`)
                                .replace("%old_url%", `zyenereviews.com/${business.slug}`)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{dict.public_profile.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => form.handleSubmit(onSubmit)()} className="bg-destructive hover:bg-destructive/90">
                            {dict.public_profile.link.confirm_change}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <style jsx global>{`
                .tab-trigger {
                    height: 3rem;
                    border-radius: 0;
                    border-bottom: 3px solid transparent;
                    background: transparent;
                    padding-left: 1.5rem;
                    padding-right: 1.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #64748b;
                    transition: all 0.2s;
                }
                .tab-trigger[data-state="active"] {
                    border-bottom-color: #2563eb;
                    background: #fff;
                    color: #2563eb;
                    box-shadow: none;
                }
                .tab-trigger:hover:not([data-state="active"]) {
                    color: #1e293b;
                    background: #f1f5f9;
                }
                .tab-content {
                    margin-top: 0;
                    outline: none;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
