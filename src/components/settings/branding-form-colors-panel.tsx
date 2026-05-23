"use client";

import type { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { BrandingFormValues } from "@/components/settings/branding-form-schema";
import {
    DEFAULT_BRAND_COLOR_HEX,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
} from "@/lib/utils/review-page-background";

type BrandingFormColorsPanelProps = {
    form: UseFormReturn<BrandingFormValues>;
    isLoading: boolean;
    onSubmit: (data: BrandingFormValues) => void | Promise<void>;
};

export function BrandingFormColorsPanel({ form, isLoading, onSubmit }: BrandingFormColorsPanelProps) {
    return (
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
                                    <div className="relative rounded-xl border border-border overflow-hidden shrink-0 transition-transform active:scale-95 cursor-pointer ring-offset-2 focus-within:ring-2 ring-primary size-11">
                                        <div className="absolute inset-0" style={{ backgroundColor: field.value }} />
                                        <FormControl>
                                            <input
                                                type="color"
                                                {...field}
                                                className="absolute inset-0 opacity-0 cursor-pointer p-0 border-0 size-full"
                                            />
                                        </FormControl>
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
                                    This color will be used for buttons, links, and accents throughout your public
                                    review page.
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
                            <FormLabel className="text-base font-medium text-foreground">Page background</FormLabel>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="flex gap-3 items-center w-full sm:w-auto">
                                    <div className="relative rounded-xl border border-border overflow-hidden shrink-0 transition-transform active:scale-95 cursor-pointer ring-offset-2 focus-within:ring-2 ring-primary size-11">
                                        <div className="absolute inset-0" style={{ backgroundColor: field.value }} />
                                        <FormControl>
                                            <input
                                                type="color"
                                                {...field}
                                                className="absolute inset-0 opacity-0 cursor-pointer p-0 border-0 size-full"
                                            />
                                        </FormControl>
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
                                    Full-screen color behind your review card on the public link (try a deep navy).
                                    Accent buttons still use Brand Color above.
                                </p>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-2 items-center">
                    {form.formState.isDirty ? (
                        <span className="text-sm text-primary mr-4 font-medium hidden sm:inline-block">
                            Unsaved changes
                        </span>
                    ) : null}
                    <Button
                        type="submit"
                        disabled={isLoading || !form.formState.isDirty}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-10 w-full sm:w-auto transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="mr-2 animate-spin size-4" /> : null}
                        Save Brand Settings
                    </Button>
                </div>
            </form>
        </div>
    );
}
