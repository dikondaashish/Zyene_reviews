"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { completeOnboarding } from "@/app/actions/onboarding";
import { fireOnboardingConfetti } from "./step5-form-confetti";

export function useStep5Form(businessId: string, onNext: () => void) {
    const [mounted, setMounted] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        setMounted(true);
        void fireOnboardingConfetti();
    }, []);

    const handleGoToDashboard = async () => {
        setIsCompleting(true);
        try {
            const result = await completeOnboarding(businessId);
            if (!result.success) {
                toast.error(result.error || "Could not finish setup. Please try again.");
                return;
            }
            onNext();
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsCompleting(false);
        }
    };

    return { mounted, isCompleting, handleGoToDashboard };
}
