"use client";

import { useState, useEffect, useRef } from "react";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Trash } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const brandingSchema = z.object({
    brand_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code."),
    // Logo is handled separately via state/upload
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface BrandingFormProps {
    business: {
        id: string;
        brand_color?: string;
        logo_url?: string;
    };
    onValuesChange?: (values: Partial<BrandingFormValues>) => void;
    onLogoChange?: (url: string | null) => void;
}

export function BrandingForm({ business, onValuesChange, onLogoChange }: BrandingFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(business.logo_url);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const supabase = createClient();

    const form = useForm<BrandingFormValues>({
        resolver: zodResolver(brandingSchema),
        defaultValues: {
            brand_color: business.brand_color || "#0f172a",
        },
    });

    const watchedValues = form.watch();
    const onValuesChangeRef = useRef(onValuesChange);
    onValuesChangeRef.current = onValuesChange;

    useEffect(() => {
        onValuesChangeRef.current?.(watchedValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(watchedValues)]);

    const deleteOldLogo = async (url: string) => {
        if (!url || !url.includes("supabase.co")) return;
        try {
            const urlObj = new URL(url);
            const parts = urlObj.pathname.split('/');
            const fileName = parts[parts.length - 1];
            await supabase.storage.from("business-logos").remove([fileName]);
        } catch (e) {
            console.error("Error deleting old logo:", e);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error("File size too large (max 2MB)");
            return;
        }

        setUploadingLogo(true);
        try {
            const fileName = `${business.id}-${Date.now()}-${file.name}`;
            const { error } = await supabase.storage
                .from("business-logos")
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from("business-logos")
                .getPublicUrl(fileName);

            // Save to DB first
            await updateBusiness({ logo_url: publicUrl });

            // If successful, delete old logo
            if (logoUrl) {
                await deleteOldLogo(logoUrl);
            }

            setLogoUrl(publicUrl);
            onLogoChange?.(publicUrl);
            toast.success("Logo uploaded!");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to upload logo");
        } finally {
            setUploadingLogo(false);
        }
    };

    const removeLogo = async () => {
        const oldLogoUrl = logoUrl;
        try {
            await updateBusiness({ logo_url: null });
            setLogoUrl(undefined);

            if (oldLogoUrl) {
                await deleteOldLogo(oldLogoUrl);
            }
            toast.success("Logo removed");
        } catch (error) {
            // Error handled in updateBusiness toast
        }
    };

    const updateBusiness = async (updates: any) => {
        const response = await fetch(`/api/businesses/${business.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error("Failed to update");
        }
        router.refresh();
    };

    const onSubmit = async (data: BrandingFormValues) => {
        setIsLoading(true);
        try {
            await updateBusiness(data);
            toast.success("Branding updated");
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm space-y-8">
            <Form {...form}>
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900">Brand Identity</h3>
                    <p className="text-sm text-slate-500">
                        Customize your review page to match your brand's look and feel.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Logo Section */}
                    <div className="space-y-4">
                        <FormLabel className="text-base font-medium text-slate-900">Logo</FormLabel>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="relative h-28 w-28 rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                {uploadingLogo ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                ) : logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={logoUrl} alt="Business Logo" className="object-cover h-full w-full" />
                                ) : (
                                    <div className="text-center p-2">
                                        <Upload className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                                        <span className="text-xs text-slate-400 font-medium">No Logo</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-3 pt-1">
                                <div className="flex flex-wrap gap-3">
                                    <div className="relative">
                                        <Button variant="outline" size="sm" type="button" className="relative h-9 px-4 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium bg-white shadow-sm" disabled={uploadingLogo}>
                                            <Upload className="mr-2 h-3.5 w-3.5" />
                                            Upload Logo
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                accept="image/png, image/jpeg, image/webp"
                                                onChange={handleLogoUpload}
                                                disabled={uploadingLogo}
                                            />
                                        </Button>
                                    </div>
                                    {logoUrl && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            type="button"
                                            className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={removeLogo}
                                            disabled={uploadingLogo}
                                        >
                                            <Trash className="mr-2 h-3.5 w-3.5" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Upload your business logo. Recommended size: 512x512px.<br />
                                    Supported formats: PNG, JPG, WebP. Max 2MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Color Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="brand_color"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-medium text-slate-900">Brand Color</FormLabel>
                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                            <div className="flex gap-3 items-center w-full sm:w-auto">
                                                <div className="relative h-11 w-11 rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0 transition-transform active:scale-95 cursor-pointer ring-offset-2 focus-within:ring-2 ring-blue-500">
                                                    <div
                                                        className="absolute inset-0"
                                                        style={{ backgroundColor: field.value }}
                                                    />
                                                    <input
                                                        type="color"
                                                        {...field}
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
                                                    />
                                                </div>
                                                <div className="flex-1 sm:w-32">
                                                    <Input
                                                        {...field}
                                                        placeholder="#0f172a"
                                                        className="font-mono h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 flex-1">
                                                This color will be used for buttons, links, and accents throughout your public review page.
                                            </p>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 h-10 w-full sm:w-auto transition-all shadow-sm active:scale-95"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Brand Settings
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Form>
        </div>
    );
}
