"use client";

import type { UseFormReturn } from "react-hook-form";
import { Check, Loader2, X } from "lucide-react";

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
import { sanitizeSlug } from "@/lib/utils";
import type { SlugFormValues } from "./slug-editor-schema";

export function SlugEditorForm({
    form,
    watchedSlug,
    initialSlug,
    isChecking,
    isAvailable,
    isSaving,
    onSubmit,
}: {
    form: UseFormReturn<SlugFormValues>;
    watchedSlug: string;
    initialSlug: string;
    isChecking: boolean;
    isAvailable: boolean | null;
    isSaving: boolean;
    onSubmit: (data: SlugFormValues) => void;
}) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Link</FormLabel>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground text-sm">
                                        zyenereviews.com/
                                    </div>
                                    <Input
                                        placeholder="your-business-name"
                                        {...field}
                                        className="pl-[9.5rem] pr-10 bg-muted/30 focus:bg-background transition-colors"
                                        onChange={(e) => field.onChange(sanitizeSlug(e.target.value))}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        {isChecking && (
                                            <Loader2 className="animate-spin text-muted-foreground size-4" />
                                        )}
                                        {!isChecking && isAvailable === true && (
                                            <Check className="text-chart-2 size-4" />
                                        )}
                                        {!isChecking && isAvailable === false && (
                                            <X className="text-destructive size-4" />
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={
                                        !form.formState.isValid ||
                                        isChecking ||
                                        isAvailable === false ||
                                        watchedSlug === initialSlug ||
                                        isSaving ||
                                        (watchedSlug !== initialSlug && isAvailable !== true)
                                    }
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                >
                                    Save
                                </Button>
                            </div>
                            <FormDescription>Only lowercase letters, numbers, and hyphens.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
