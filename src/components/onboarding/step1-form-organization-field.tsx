"use client";

import type { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";

import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StepOrganizationFormData } from "@/lib/validations/onboarding";

export function Step1FormOrganizationField({
    form,
    submitting,
    isLoading,
}: {
    form: UseFormReturn<StepOrganizationFormData>;
    submitting: boolean;
    isLoading: boolean;
}) {
    return (
        <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
                <FormItem>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Label htmlFor="organizationName" className="text-sm font-semibold text-foreground">
                            Organization name
                        </Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="text-muted-foreground cursor-help size-3.5" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[250px] p-3 text-xs leading-relaxed">
                                    <p>
                                        Your <strong>Organization</strong> is the umbrella account that owns one or
                                        more business locations. Most users just use their company name here.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <FormControl>
                        <Input
                            id="organizationName"
                            placeholder="e.g. Acme Inc."
                            autoFocus
                            disabled={submitting || isLoading}
                            className="h-12 text-sm bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all placeholder:text-muted-foreground/50"
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground/70 mt-1.5">
                        Don&apos;t worry, you can rename your organization later.
                    </p>
                </FormItem>
            )}
        />
    );
}
