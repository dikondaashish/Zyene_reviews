"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
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
import { createClient } from "@/lib/db/supabase/client";
import type { BusinessUpdatePayload } from "@/types/components";
import {
    DEFAULT_BRAND_COLOR_HEX,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
} from "@/lib/utils/review-page-background";

const brandingSchema = z.object({
    brand_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code."),
    review_page_background_color: z
        .string()
        .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code."),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface BrandingFormProps {
    business: {
        id: string;
        brand_color?: string | null;
        review_page_background_color?: string | null;
        logo_url?: string | null;
    };
    onValuesChange?: (values: Partial<BrandingFormValues>) => void;
    onLogoChange?: (url: string | null) => void;
}

export function BrandingForm({ business, onValuesChange, onLogoChange }: BrandingFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(business.logo_url);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    
    // Crop state
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [crop, setCrop] = useState<Crop>({
        unit: 'px',
        width: 256,
        height: 256,
        x: 0,
        y: 0
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const supabase = useMemo(() => createClient(), []);

    const form = useForm<BrandingFormValues>({
        resolver: zodResolver(brandingSchema),
        defaultValues: {
            brand_color: (business.brand_color || DEFAULT_BRAND_COLOR_HEX).toLowerCase(),
            review_page_background_color: (
                business.review_page_background_color || DEFAULT_REVIEW_PAGE_BACKGROUND_HEX
            ).toLowerCase(),
        },
    });

    const watchedValues = form.watch();

    useEffect(() => {
        onValuesChange?.(watchedValues);
    }, [JSON.stringify(watchedValues), onValuesChange]);

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

    const getCroppedImg = async (
        image: HTMLImageElement,
        crop: PixelCrop,
        fileName: string
    ): Promise<File> => {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        // Output at exactly 512x512
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2d context");
        }

        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            512,
            512
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                resolve(new File([blob], fileName, { type: "image/webp" }));
            }, "image/webp", 0.95);
        });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error("File size too large (max 2MB)");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            toast.error("Unsupported file format (PNG, JPG, WebP only)");
            return;
        }

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setSelectedImage(reader.result?.toString() || null);
            setCrop({ unit: "px", width: 256, height: 256, x: 0, y: 0 }); // reset crop position
            setCompletedCrop(null);
        });
        reader.readAsDataURL(file);
        setSelectedFile(file);
        
        // Reset input value to allow selecting same file after cancelling
        e.target.value = '';
    };

    const handleSaveCrop = async () => {
        if (!selectedImage || !completedCrop || !imgRef.current || !selectedFile) {
            toast.error("Please crop your image or click cancel.");
            return;
        }

        setUploadingLogo(true);
        try {
            const croppedFile = await getCroppedImg(
                imgRef.current,
                completedCrop,
                `${business.id}-${Date.now()}-logo.webp`
            );

            const { error: uploadError } = await supabase.storage
                .from("business-logos")
                .upload(croppedFile.name, croppedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("business-logos")
                .getPublicUrl(croppedFile.name);

            // Save to DB
            await updateBusiness({ logo_url: publicUrl });

            // If successful, delete old logo
            if (logoUrl) {
                await deleteOldLogo(logoUrl);
            }

            setLogoUrl(publicUrl);
            onLogoChange?.(publicUrl);
            
            // Clean up states
            setSelectedImage(null);
            setSelectedFile(null);
            toast.success("Logo uploaded successfully!");
        } catch (error: unknown) {
            console.error(error);
            toast.error("Failed to save logo. Please try again.");
        } finally {
            setUploadingLogo(false);
        }
    };

    const removeLogo = async () => {
        const oldLogoUrl = logoUrl;
        try {
            await updateBusiness({ logo_url: null });
            setLogoUrl(undefined);
            onLogoChange?.(null);

            if (oldLogoUrl) {
                await deleteOldLogo(oldLogoUrl);
            }
            toast.success("Logo removed");
        } catch (error) {
            // Error handled in updateBusiness toast
        }
    };

    const updateBusiness = async (updates: BusinessUpdatePayload) => {
        const response = await fetch(`/api/businesses/${business.id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });

        const data = (await response.json().catch(() => ({}))) as {
            success?: boolean;
            error?: string;
        };

        if (!response.ok || data.success !== true) {
            const errorMsg =
                typeof data.error === "string" && data.error.length > 0
                    ? data.error
                    : "Failed to update";
            throw new Error(errorMsg);
        }
        router.refresh();
    };

    const onSubmit = async (data: BrandingFormValues) => {
        setIsLoading(true);
        try {
            await updateBusiness(data);
            form.reset(data);
            toast.success("Branding updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to save changes");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-8">
            <Form {...form}>
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-foreground">Brand Identity</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize your review page to match your brand's look and feel.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Logo Section */}
                    <div className="space-y-4">
                        <FormLabel className="text-base font-medium text-foreground">Business Logo</FormLabel>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="relative h-28 w-28 rounded-2xl border-2 border-border bg-muted/50 overflow-hidden flex items-center justify-center shrink-0">
                                {uploadingLogo ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                ) : logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={logoUrl} alt="Business Logo" className="object-cover h-full w-full" />
                                ) : (
                                    <div className="text-center p-2">
                                        <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1" />
                                        <span className="text-xs text-muted-foreground font-medium">No Logo</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-3 pt-1">
                                <div className="flex flex-wrap gap-3">
                                    <div className="relative">
                                        <Button variant="outline" size="sm" type="button" className="relative h-9 px-4 border-border hover:bg-muted font-medium bg-card" disabled={uploadingLogo}>
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
                                            className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                            onClick={removeLogo}
                                            disabled={uploadingLogo}
                                        >
                                            <Trash className="mr-2 h-3.5 w-3.5" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Upload your business logo. Recommended size: 512x512px.<br />
                                    Supported formats: PNG, JPG, WebP. Max 2MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Color Section */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="brand_color"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-medium text-foreground">Brand Color</FormLabel>
                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                            <div className="flex gap-3 items-center w-full sm:w-auto">
                                                <div className="relative h-11 w-11 rounded-xl border border-border overflow-hidden shrink-0 transition-transform active:scale-95 cursor-pointer ring-offset-2 focus-within:ring-2 ring-primary">
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
                                                        placeholder={DEFAULT_BRAND_COLOR_HEX}
                                                        className="font-mono h-11 border-border bg-muted/30 focus:bg-background transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground flex-1">
                                                This color will be used for buttons, links, and accents throughout your public review page.
                                            </p>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="review_page_background_color"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-medium text-foreground">
                                            Page background
                                        </FormLabel>
                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                            <div className="flex gap-3 items-center w-full sm:w-auto">
                                                <div className="relative h-11 w-11 rounded-xl border border-border overflow-hidden shrink-0 transition-transform active:scale-95 cursor-pointer ring-offset-2 focus-within:ring-2 ring-primary">
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
                                                        placeholder={DEFAULT_REVIEW_PAGE_BACKGROUND_HEX}
                                                        className="font-mono h-11 border-border bg-muted/30 focus:bg-background transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground flex-1">
                                                Full-screen color behind your review card on the public link (try a
                                                deep navy). Accent buttons still use Brand Color above.
                                            </p>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-2 items-center">
                                {form.formState.isDirty && (
                                    <span className="text-sm text-primary mr-4 font-medium hidden sm:inline-block">Unsaved changes</span>
                                )}
                                <Button
                                    type="submit"
                                    disabled={isLoading || !form.formState.isDirty}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-10 w-full sm:w-auto transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Brand Settings
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Form>

            {/* Crop Dialog */}
            <Dialog open={!!selectedImage} onOpenChange={(open) => {
                if (!open && !uploadingLogo) {
                    setSelectedImage(null);
                    setSelectedFile(null);
                }
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Crop your logo</DialogTitle>
                        <DialogDescription>
                            Adjust your logo to a perfect square before saving.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex items-center justify-center p-4 bg-muted/20 border border-border rounded-xl min-h-[300px]">
                        {selectedImage && (
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1} // Fix to 1:1 square ratio
                                circularCrop={false}
                                className="max-h-[400px]"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    ref={imgRef}
                                    src={selectedImage}
                                    alt="Crop me"
                                    onLoad={(e) => {
                                        // Center initial crop
                                        const { width, height } = e.currentTarget;
                                        const size = Math.min(width, height, 300);
                                        const x = (width - size) / 2;
                                        const y = (height - size) / 2;
                                        const initialCrop = { unit: 'px' as const, width: size, height: size, x, y };
                                        setCrop(initialCrop);
                                        setCompletedCrop(initialCrop);
                                    }}
                                    className="max-h-[400px] object-contain"
                                />
                            </ReactCrop>
                        )}
                    </div>
                    
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setSelectedImage(null);
                                setSelectedFile(null);
                            }}
                            disabled={uploadingLogo}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveCrop}
                            disabled={uploadingLogo || !completedCrop?.width || !completedCrop?.height}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {uploadingLogo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {uploadingLogo ? "Saving..." : "Save Crop"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
