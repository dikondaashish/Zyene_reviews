
"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
        onValuesChange?.(watchedValues);
    }, [JSON.stringify(watchedValues), onValuesChange]);

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
            const { data, error } = await supabase.storage
                .from("business-logos")
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from("business-logos")
                .getPublicUrl(fileName);

            setLogoUrl(publicUrl);
            onLogoChange?.(publicUrl);

            // Save immediately to DB
            await updateBusiness({ logo_url: publicUrl });
            toast.success("Logo uploaded!");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to upload logo");
        } finally {
            setUploadingLogo(false);
        }
    };

    const removeLogo = async () => {
        setLogoUrl(undefined);
        await updateBusiness({ logo_url: null });
        toast.success("Logo removed");
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
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <Form {...form}>
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-slate-900">Brand Identity</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Ensure your review page matches your brand.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Logo Section */}
                    <div className="space-y-4">
                        <FormLabel className="text-base font-medium">Logo</FormLabel>
                        <div className="flex items-start gap-5">
                            <div className="relative h-28 w-28 rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                {uploadingLogo ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                ) : logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={logoUrl} alt="Business Logo" className="object-cover h-full w-full" />
                                ) : (
                                    <span className="text-xs text-muted-foreground text-center px-2 font-medium">No Logo</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 pt-1">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="relative h-9 px-4 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium bg-white shadow-sm" disabled={uploadingLogo}>
                                        <Upload className="mr-2 h-3.5 w-3.5" />
                                        Upload
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={handleLogoUpload}
                                            disabled={uploadingLogo}
                                        />
                                    </Button>
                                    {logoUrl && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={removeLogo}
                                            disabled={uploadingLogo}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed max-w-[140px]">
                                    Max 2MB. PNG, JPG, WebP. Recommended 512x512.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Color Section - Wrapped in form here to isolate submit if needed, or just part of larger layout */}
                    <div className="space-y-4">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="brand_color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-medium">Brand Color</FormLabel>
                                        <div className="flex gap-3 items-center">
                                            <div className="relative h-11 w-11 rounded-lg border border-slate-200 shadow-sm overflow-hidden shrink-0">
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
                                            <div className="flex-1">
                                                <Input
                                                    {...field}
                                                    placeholder="#0f172a"
                                                    className="font-mono h-11 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <FormDescription className="text-xs mt-2">
                                            Used for buttons and accents on your public page.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 h-10 w-full md:w-auto"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Color
                            </Button>
                        </form>
                    </div>
                </div>
            </Form>
        </div>
    );
}
