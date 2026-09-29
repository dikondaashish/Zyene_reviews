"use client";

import { Loader2, ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STEP2_US_STATES } from "@/components/onboarding/step2-form-constants";
import type { GoogleConnectionState } from "@/components/onboarding/step2-form-types";
import type { UseFormReturn } from "react-hook-form";
import type { StepBusinessLocationFormData } from "@/lib/validations/onboarding";

export function Step2FormManualEntryPanel({
    form,
    isLoading,
    googleState,
    advancing,
    onSaveAndNext,
    onSkip,
}: {
    form: UseFormReturn<StepBusinessLocationFormData>;
    isLoading: boolean;
    googleState: GoogleConnectionState;
    advancing: boolean;
    onSaveAndNext: () => void | Promise<void>;
    onSkip: () => void | Promise<void>;
}) {
    return (
        <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-border/60" />
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground/60 shrink-0">
                        or enter manually
                    </span>
                    <div className="h-px flex-1 bg-border/60" />
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-xs text-muted-foreground">All fields are required. Enter your full street address.</p>
                <div className="space-y-1.5">
                    <Label htmlFor="onboarding-business-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">
                        Business Name
                    </Label>
                    <Input
                        id="onboarding-business-name" aria-required="true" aria-invalid={!!form.formState.errors.businessName} aria-describedby={form.formState.errors.businessName ? "onboarding-business-name-error" : undefined}
                        {...form.register("businessName")}
                        placeholder="e.g., Acme Corp"
                        disabled={isLoading || googleState.status === "success"}
                        className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-colors placeholder:text-muted-foreground/50"
                    />
                    {form.formState.errors.businessName && <p id="onboarding-business-name-error" className="text-xs text-destructive">{form.formState.errors.businessName.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="onboarding-address" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">
                        Address
                    </Label>
                    <Input
                        id="onboarding-address" aria-required="true" aria-invalid={!!form.formState.errors.address} aria-describedby={form.formState.errors.address ? "onboarding-address-error" : undefined}
                        {...form.register("address")}
                        placeholder="e.g., 123 Main St, City"
                        disabled={isLoading || googleState.status === "success"}
                        className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-colors placeholder:text-muted-foreground/50"
                    />
                    {form.formState.errors.address && <p id="onboarding-address-error" className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="onboarding-city" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">
                            City
                        </Label>
                        <Input
                            id="onboarding-city" aria-required="true" aria-invalid={!!form.formState.errors.city} aria-describedby={form.formState.errors.city ? "onboarding-city-error" : undefined}
                            {...form.register("city")}
                            placeholder="City"
                            disabled={isLoading || googleState.status === "success"}
                            className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-colors placeholder:text-muted-foreground/50"
                        />
                        {form.formState.errors.city && <p id="onboarding-city-error" className="text-xs text-destructive">{form.formState.errors.city.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="onboarding-state" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-0.5">
                            State
                        </Label>
                        <Select
                            value={form.watch("state")}
                            onValueChange={(v) => form.setValue("state", v)}
                            disabled={isLoading || googleState.status === "success"}
                        >
                            <SelectTrigger id="onboarding-state" aria-required="true" className="h-12 bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl text-sm transition-colors">
                                <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                                {STEP2_US_STATES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={form.handleSubmit(onSaveAndNext)}
                    disabled={advancing || isLoading || !form.formState.isValid}
                    className="w-full h-12 mt-2 text-sm font-semibold cta-button"
                >
                    {advancing || isLoading ? (
                        <>
                            <Loader2 className="mr-2 animate-spin size-5" /> Saving...
                        </>
                    ) : (
                        <>
                            Continue
                            <ArrowRight className="ml-2 size-5" />
                        </>
                    )}
                </Button>

                <div className="space-y-3 pt-3">
                    <p className="text-[11px] text-muted-foreground/50 flex items-center justify-center gap-1.5 font-medium">
                        <LockKeyhole aria-hidden="true" className="shrink-0 size-3" />
                        We only read your profile. We never post on your behalf.
                    </p>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => void onSkip()}
                            disabled={advancing}
                            className="text-xs font-semibold text-muted-foreground/60 hover:text-primary transition-colors tracking-wide cursor-pointer hover:underline underline-offset-4"
                        >
                            I&apos;ll connect later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
