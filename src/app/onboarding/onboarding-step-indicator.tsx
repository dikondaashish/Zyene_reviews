"use client";

import { motion } from "framer-motion";
import { ONBOARDING_STEPS } from "./onboarding-types";

export function OnboardingStepIndicator({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex items-center justify-center gap-0">
            {ONBOARDING_STEPS.map((step, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                const StepIcon = step.icon;

                return (
                    <div key={step.label} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                className={`rounded-2xl flex items-center justify-center transition-all duration-300 cursor-default ${ isCompleted ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : isActive ? "bg-primary/10 text-primary ring-2 ring-primary/30 shadow-sm" : "bg-secondary/60 text-muted-foreground" } size-10`}
                                animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                {isCompleted ? (
                                    <svg
                                        className="size-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    <StepIcon className="size-4" />
                                )}
                            </motion.div>
                            <span
                                className={`text-[11px] font-semibold tracking-wide hidden sm:block ${
                                    isActive
                                        ? "text-primary"
                                        : isCompleted
                                          ? "text-primary/70"
                                          : "text-muted-foreground"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {index < ONBOARDING_STEPS.length - 1 && (
                            <div className="w-6 sm:w-10 h-[2px] mx-1 sm:mx-1.5 mb-6 sm:mb-4 rounded-full overflow-hidden bg-secondary/60">
                                <motion.div
                                    className="h-full bg-primary rounded-full"
                                    initial={false}
                                    animate={{ width: isCompleted ? "100%" : "0%" }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
