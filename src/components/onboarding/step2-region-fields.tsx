"use client";

import { useWatch, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STEP2_COUNTRIES, STEP2_US_STATES } from "@/components/onboarding/step2-form-constants";
import type { StepBusinessLocationFormData } from "@/lib/validations/onboarding";

const FILL = { shouldValidate: true, shouldDirty: true } as const;

function countryName(code: string): string {
    try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
    } catch {
        return code;
    }
}

function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? <p id={id} className="text-xs text-destructive">{message}</p> : null;
}

/** City, state (a US code, or free text elsewhere) and country. useWatch so Google picks redraw them. */
export function Step2RegionFields({ form, disabled }: { form: UseFormReturn<StepBusinessLocationFormData>; disabled: boolean }) {
    const [state, country = "US"] = useWatch({ control: form.control, name: ["state", "country"] });
    const errors = form.formState.errors;
    const isUs = country === "US";
    // A country Google returned that isn't in the short list still needs to show.
    const countries = (STEP2_COUNTRIES as readonly string[]).includes(country) ? STEP2_COUNTRIES : [country, ...STEP2_COUNTRIES];

    const changeCountry = (next: string) => {
        form.setValue("country", next, FILL);
        // Another country's state or province doesn't carry over.
        if (next !== country) form.setValue("state", "", FILL);
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="onboarding-city">City</Label>
                    <Input id="onboarding-city" aria-required="true" aria-invalid={!!errors.city} aria-describedby={errors.city ? "onboarding-city-error" : undefined}
                        {...form.register("city")} placeholder="City" disabled={disabled} className="h-11" />
                    <FieldError id="onboarding-city-error" message={errors.city?.message} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="onboarding-state">{isUs ? "State" : "State / province"}</Label>
                    {isUs ? (
                        <Select value={state} onValueChange={(v) => form.setValue("state", v, FILL)} disabled={disabled}>
                            <SelectTrigger id="onboarding-state" aria-required="true" aria-invalid={!!errors.state} className="h-11 w-full">
                                <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                                {STEP2_US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input id="onboarding-state" {...form.register("state")} placeholder="Optional" disabled={disabled} className="h-11" />
                    )}
                    <FieldError id="onboarding-state-error" message={errors.state?.message} />
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="onboarding-country">Country</Label>
                <Select value={country} onValueChange={changeCountry} disabled={disabled}>
                    <SelectTrigger id="onboarding-country" aria-required="true" className="h-11 w-full">
                        <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((code) => <SelectItem key={code} value={code}>{countryName(code)}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </>
    );
}
