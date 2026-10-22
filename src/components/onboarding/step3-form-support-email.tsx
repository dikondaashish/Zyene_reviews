"use client";

import type { UseFormRegister } from "react-hook-form";
import { Reply } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StepCategoryFormData } from "@/lib/validations/onboarding";

/**
 * Asked once, at setup, so review request emails have somewhere for customer
 * replies to land. Prefilled but visible: the owner confirms or changes it.
 */
export function Step3FormSupportEmail({ register, error, disabled }: {
    register: UseFormRegister<StepCategoryFormData>;
    error?: string;
    disabled?: boolean;
}) {
    return (
        <div className="space-y-2 rounded-2xl border border-border/70 bg-card/60 p-4 text-left">
            <Label htmlFor="support-email" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Reply className="size-4 text-primary" aria-hidden />
                Where should customer replies go?
            </Label>
            <Input
                id="support-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@yourbusiness.com"
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby="support-email-hint"
                className="h-11"
                {...register("supportEmail")}
            />
            {error ? (
                <p className="text-sm font-medium text-destructive">{error}</p>
            ) : (
                <p id="support-email-hint" className="text-xs leading-relaxed text-muted-foreground">
                    When a customer replies to a review request email, it lands here. Use a business inbox if you have one.
                    You can change it later in Settings → Business Info.
                </p>
            )}
        </div>
    );
}
