"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { completeOnboarding } from "@/app/actions/onboarding";
import { completeTour } from "@/app/actions/tour";
import { fireOnboardingConfetti } from "./step5-form-confetti";

export type Step5Destination = "dashboard" | "requests" | "calendar" | "tour";

const DESTINATIONS: Record<Exclude<Step5Destination, "dashboard">, string> = {
    requests: "/requests",
    calendar: "/automations/calendar",
    tour: "/dashboard?tour=true",
};

export function useStep5Form(businessId: string, onNext: () => void) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        setMounted(true);
        void fireOnboardingConfetti();
    }, []);

    const handleGoToDashboard = async (destination: Step5Destination = "dashboard") => {
        setIsCompleting(true);
        try {
            const result = await completeOnboarding(businessId);
            if (!result.success) {
                toast.error(result.error || "Could not finish setup. Please try again.");
                return;
            }
            // This screen is the welcome. The product tour only runs when the owner asks for it
            // (here or from Settings), so a new owner never gets a chain of pop-ups.
            if (destination !== "tour") await completeTour().catch(() => null);
            if (destination === "dashboard") onNext();
            else router.push(DESTINATIONS[destination]);
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsCompleting(false);
        }
    };

    return { mounted, isCompleting, handleGoToDashboard };
}
