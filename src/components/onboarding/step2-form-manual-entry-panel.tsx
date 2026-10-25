"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useFormState, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Step2BusinessNameSearch } from "@/components/onboarding/step2-business-name-search";
import { Step2RegionFields } from "@/components/onboarding/step2-region-fields";
import { ONBOARDING_ACTION } from "@/components/onboarding/onboarding-step-card";
import type { StepBusinessLocationFormData } from "@/lib/validations/onboarding";

/** Find the business by name (Google fills the rest) or type every field. */
export function Step2FormManualEntryPanel({ form, disabled }: { form: UseFormReturn<StepBusinessLocationFormData>; disabled: boolean }) {
    const addressError = form.formState.errors.address;
    return (
        <div className="space-y-4">
            <div>
                <h2 className="ui-section-title text-foreground">Or find it by name</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Type your business name and pick it from the list, or fill in every field yourself.</p>
            </div>
            <Step2BusinessNameSearch form={form} disabled={disabled} />
            <div className="space-y-1.5">
                <Label htmlFor="onboarding-address">Address</Label>
                <Input
                    id="onboarding-address" aria-required="true" aria-invalid={!!addressError} aria-describedby={addressError ? "onboarding-address-error" : undefined}
                    {...form.register("address")}
                    placeholder="e.g., 123 Main St"
                    disabled={disabled}
                    className="h-11"
                />
                {addressError && <p id="onboarding-address-error" className="text-xs text-destructive">{addressError.message}</p>}
            </div>
            <Step2RegionFields form={form} disabled={disabled} />
        </div>
    );
}

/** Subscribed on its own so it turns on as soon as a Google pick fills the form. */
export function Step2ContinueButton({ form, busy }: { form: UseFormReturn<StepBusinessLocationFormData>; busy: boolean }) {
    const { isValid } = useFormState({ control: form.control });
    return (
        <Button type="submit" disabled={busy || !isValid} className={ONBOARDING_ACTION}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {busy ? "Saving…" : "Continue"}
            {!busy && <ArrowRight className="size-4" aria-hidden />}
        </Button>
    );
}
