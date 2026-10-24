"use client";

import { Check } from "lucide-react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { StepCategoryFormData } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils";
import { STEP3_CATEGORIES } from "./step3-form-categories";

export function Step3FormCategoryGrid({
    control,
    isLoading,
    onTriggerCategory,
}: {
    control: Control<StepCategoryFormData>;
    isLoading: boolean;
    onTriggerCategory: () => void;
}) {
    return (
        <Controller
            control={control}
            name="category"
            render={({ field }) => (
                <div role="radiogroup" aria-label="Industry" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {STEP3_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = field.value === cat.value;

                        return (
                            <button
                                key={cat.value}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => {
                                    field.onChange(cat.value);
                                    onTriggerCategory();
                                }}
                                disabled={isLoading}
                                className={cn(
                                    "relative flex flex-col items-center gap-2 rounded-lg border px-2 py-3 transition-colors cursor-pointer",
                                    isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
                                )}
                            >
                                {isSelected && <Check className="absolute right-1.5 top-1.5 size-3.5 text-primary" aria-hidden />}
                                <span className={cn("grid size-8 place-items-center rounded-md", isSelected ? "bg-primary/10 text-primary" : "bg-muted text-foreground")} aria-hidden>
                                    <Icon className="size-4" />
                                </span>
                                <span className={cn("text-center text-xs font-medium leading-tight", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        />
    );
}
