"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Step1Form } from "@/components/onboarding/step1-form";
import { Step3Form } from "@/components/onboarding/step3-form";
import { Step4SubscriptionForm } from "@/components/onboarding/step4-subscription-form";
import { Step5Form } from "@/components/onboarding/step5-form";
import type {
    OnboardingBusiness,
    OnboardingOrganization,
    OnboardingUser,
} from "./onboarding-types";

type OnboardingGlassStepsSectionProps = {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    isLoading: boolean;
    organization: OnboardingOrganization;
    business: OnboardingBusiness | null;
    user: OnboardingUser;
    googleConnected: boolean;
    showPaymentCancelled: boolean;
    handleStep1Next: () => void;
    reset: () => void;
};

export function OnboardingGlassStepsSection({
    currentStep,
    setCurrentStep,
    isLoading,
    organization,
    business,
    user,
    googleConnected,
    showPaymentCancelled,
    handleStep1Next,
    reset,
}: OnboardingGlassStepsSectionProps) {
    const router = useRouter();

    return (
        <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/5 via-transparent to-sync-action/5 rounded-[2rem] blur-sm" />

            <div className="relative pro-card p-5 sm:p-7">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Step1Form
                                onNext={handleStep1Next}
                                isLoading={isLoading}
                                organizationId={organization.id}
                                initialOrgName={organization.name}
                            />
                        </motion.div>
                    )}
                    {currentStep === 3 && business && (
                        <motion.div
                            key="step-3"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer group"
                            >
                                <ArrowLeft className="group-hover:-translate-x-0.5 transition-transform size-3.5" />
                                Back
                            </button>
                            <Step3Form
                                businessId={business.id}
                                businessName={business.name}
                                city={business.city ?? ""}
                                initialCategory={business.category ?? undefined}
                                isGoogleConnected={googleConnected}
                                onNext={async () => setCurrentStep(4)}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}
                    {currentStep === 4 && organization && (
                        <motion.div
                            key="step-4"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                type="button"
                                onClick={() => setCurrentStep(3)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer group"
                            >
                                <ArrowLeft className="group-hover:-translate-x-0.5 transition-transform size-3.5" />
                                Back
                            </button>
                            <Step4SubscriptionForm
                                organizationId={organization.id}
                                isGoogleConnected={googleConnected}
                                isCancelled={showPaymentCancelled}
                                onNext={() => setCurrentStep(5)}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}
                    {currentStep === 5 && business && user && (
                        <motion.div
                            key="step-5"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Step5Form
                                businessId={business.id}
                                businessName={business.name}
                                userEmail={user.email || ""}
                                userName={user.user_metadata?.full_name || "Valued Customer"}
                                googleConnected={googleConnected}
                                onNext={() => {
                                    reset();
                                    router.push("/dashboard");
                                }}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
