"use client";

import { motion } from "framer-motion";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { StepCategoryFormData } from "@/lib/validations/onboarding";
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
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {STEP3_CATEGORIES.map((cat, index) => {
                        const Icon = cat.icon;
                        const isSelected = field.value === cat.value;

                        return (
                            <motion.button
                                key={cat.value}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03, duration: 0.3 }}
                                onClick={() => {
                                    field.onChange(cat.value);
                                    onTriggerCategory();
                                }}
                                disabled={isLoading}
                                className={`
                      relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                      ${
                          isSelected
                              ? "border-primary bg-primary/[0.06] ring-2 ring-primary/20"
                              : "border-border/40 bg-background/40 hover:border-primary/30 hover:bg-primary/[0.02]"
                      }
                    `}
                            >
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                    >
                                        <svg
                                            className="w-3 h-3 text-primary-foreground"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </motion.div>
                                )}

                                <div
                                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                      ${isSelected ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground group-hover:text-primary/70"}
                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span
                                    className={`text-xs font-semibold text-center leading-tight ${
                                        isSelected
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    }`}
                                >
                                    {cat.label}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            )}
        />
    );
}
