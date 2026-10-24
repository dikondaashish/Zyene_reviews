"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loadOnboardingAutomateOptions } from "@/app/actions/onboarding/results";
import { updateOnboardingStep } from "@/app/actions/onboarding";
import { availableOptions, replyRulesPayload, type AutomateChoice, type AutomateOption } from "./step-automate-options";

const ONBOARDING_DONE_STEP = 5;

/** Stripe's webhook can take a few seconds to switch the plan on after checkout. */
const PLAN_RETRIES = 5;
const PLAN_RETRY_MS = 3000;

export function useStepAutomate(businessId: string, onNext: () => void) {
    const [plan, setPlan] = useState<{ aiAllowed: boolean; autoAllowed: boolean } | null>(null);
    const [choice, setChoice] = useState<AutomateChoice | null>(null);
    const [saving, setSaving] = useState(false);

    // Bumping this re-runs the plan check ("Check again" after a slow Stripe webhook).
    const [checkRound, setCheckRound] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const check = async (attempt: number) => {
            const response = await loadOnboardingAutomateOptions(businessId);
            if (cancelled) return;
            const allowed = response.success ? response : { aiAllowed: false, autoAllowed: false };
            if (!allowed.aiAllowed && attempt < PLAN_RETRIES) {
                timer = setTimeout(() => void check(attempt + 1), PLAN_RETRY_MS);
                return;
            }
            setPlan({ aiAllowed: allowed.aiAllowed, autoAllowed: allowed.autoAllowed });
        };
        void check(0);
        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [businessId, checkRound]);

    const checkAgain = () => {
        setPlan(null);
        setCheckRound((n) => n + 1);
    };

    const options = plan ? (plan.aiAllowed ? availableOptions(plan.autoAllowed) : availableOptions(false).filter((o) => o.id === "manual")) : [];
    const selected: AutomateOption | undefined = options.find((o) => o.id === choice) ?? options[0];

    /** Saved progress first, so a reload never lands back on this step. */
    const advance = async () => {
        await updateOnboardingStep(businessId, ONBOARDING_DONE_STEP).catch(() => null);
        onNext();
    };

    const save = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const response = await fetch("/api/settings/reply-rules", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(replyRulesPayload(businessId, selected)),
            });
            const body = (await response.json().catch(() => null)) as { error?: string } | null;
            if (!response.ok) {
                toast.error(body?.error || "Could not save your reply set-up. Skip for now and set it up later in Settings.");
                return;
            }
            await advance();
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const skip = () => void advance();

    return { plan, options, selected, setChoice, saving, save, skip, checkAgain };
}
