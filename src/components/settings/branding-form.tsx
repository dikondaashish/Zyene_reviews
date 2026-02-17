
"use client";

import { useState } from "react";
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
}

export function BrandingForm({ business }: BrandingFormProps) {
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
        <div className="space-y-6 rounded-lg border p-4 bg-muted/10">
            <Form {...form}>
                <div>
                    <h3 className="text-lg font-medium">Brand Identity</h3>
                    <p className="text-sm text-muted-foreground">
                        Ensure your review page matches your brand.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Logo Section */}
                    <div className="space-y-4">
                        <FormLabel>Logo</FormLabel>
                        <div className="flex items-center gap-4">
                            <div className="relative h-24 w-24 rounded-full border bg-background overflow-hidden flex items-center justify-center">
                                {uploadingLogo ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={logoUrl} alt="Business Logo" className="object-cover h-full w-full" />
                                ) : (
                                    <span className="text-xs text-muted-foreground text-center px-2">No Logo</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="relative" disabled={uploadingLogo}>
                                        <Upload className="mr-2 h-4 w-4" />
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
                                        <Button variant="ghost" size="icon" onClick={removeLogo} disabled={uploadingLogo}>
                                            <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">Max 2MB. PNG, JPG, WebP.</p>
                            </div>
                        </div>
                    </div>

                    {/* Color Section */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="brand_color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand Color</FormLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            {...field}
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input {...field} placeholder="#0f172a" className="font-mono" />
                                    </div>
                                    <FormDescription>
                                        Used for buttons and accents on your public page.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Color
                        </Button>
                    </form>
                </div>
            </Form>
        </div>
    );
}
