"use client";

import type { UseFormRegister } from "react-hook-form";
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
        <div className="space-y-1.5 border-t border-border pt-5 text-left">
            <Label htmlFor="support-email">
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
