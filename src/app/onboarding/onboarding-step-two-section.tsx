"use client";

import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { Step2Form } from "@/components/onboarding/step2-form";
import type { OnboardingBusiness } from "./onboarding-types";

type OnboardingStepTwoSectionProps = {
    business: OnboardingBusiness | null;
    setCurrentStep: (step: number) => void;
    isLoading: boolean;
    googleConnected: boolean;
    setGoogleConnected: (connected: boolean) => void;
    pendingGoogleCode: string | null;
    setPendingGoogleCode: (code: string | null) => void;
    handleBusinessUpdate: (updated: Partial<OnboardingBusiness>) => void;
};

export function OnboardingStepTwoSection({
    business,
    setCurrentStep,
    isLoading,
    googleConnected,
    setGoogleConnected,
    pendingGoogleCode,
    setPendingGoogleCode,
    handleBusinessUpdate,
}: OnboardingStepTwoSectionProps) {
    if (!business) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary size-8" />
            </div>
        );
    }

    return (
        <motion.div
            key="step-2-outer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
        >
            <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer group"
            >
                <ArrowLeft className="group-hover:-translate-x-0.5 transition-transform size-3.5" />
                Back
            </button>
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[rgba(212,160,84,0.08)] via-transparent to-primary/5 rounded-[2rem] blur-sm" />
                <div className="relative">
                    <Step2Form
                        businessId={business.id}
                        businessName={business.name}
                        city={business.city ?? ""}
                        address={business.address_line1 ?? ""}
                        state={business.state ?? ""}
                        phone={business.phone ?? ""}
                        pendingGoogleCode={pendingGoogleCode}
                        onGoogleCodeConsumed={() => setPendingGoogleCode(null)}
                        onBusinessUpdate={handleBusinessUpdate}
                        initialConnected={googleConnected}
                        onNext={async () => {
                            setGoogleConnected(true);
                            setCurrentStep(3);
                        }}
                        onSkip={async () => {
                            setCurrentStep(3);
                        }}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </motion.div>
    );
}
