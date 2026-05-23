"use client";

import { ArrowRight, LayoutGrid, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Step3FormCategoryGrid } from "./step3-form-category-grid";
import { Step3FormHeader } from "./step3-form-header";
import { useStep3Form } from "./use-step3-form";

interface Step3FormProps {
    businessId: string;
    businessName: string;
    city: string;
    initialCategory?: string;
    isGoogleConnected?: boolean;
    onNext: () => void;
    isLoading?: boolean;
}

export function Step3Form({
    businessId,
    initialCategory,
    isGoogleConnected = false,
    onNext,
    isLoading: externalIsLoading = false,
}: Step3FormProps) {
    const { form, isLoading, selectedCategory, onSubmit } = useStep3Form(
        businessId,
        initialCategory,
        onNext,
        externalIsLoading,
    );

    return (
        <div className="space-y-5">
            <Step3FormHeader initialCategory={initialCategory} isGoogleConnected={isGoogleConnected} />

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <Step3FormCategoryGrid
                    control={form.control}
                    isLoading={isLoading}
                    onTriggerCategory={() => form.trigger("category")}
                />
                {form.formState.errors.category && (
                    <p className="text-sm font-medium text-destructive flex items-center gap-1.5 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                        {form.formState.errors.category.message}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={!selectedCategory || isLoading}
                    className="w-full h-12 font-semibold cta-button text-sm"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            Continue
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                        </>
                    )}
                </Button>
            </form>

            <div className="flex items-start gap-3 p-4 bg-primary/[0.04] border border-primary/10 rounded-2xl">
                <LayoutGrid className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Don&apos;t see yours?</span> Pick <strong>Other</strong>{" "}
                    and we&apos;ll customize your setup later.
                </p>
            </div>
        </div>
    );
}
