"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getTrialBannerState } from "@/lib/billing/trial-banner-state";

export interface TrialBannerProps {
    /** organizations.plan_status - the banner only renders for "trialing". */
    planStatus?: string | null;
    /** organizations.trial_ends_at (ISO), written by billing sync while trialing. */
    trialEndsAt?: string | null;
    /** Display name of the plan being trialed, e.g. "Starter". */
    planName?: string | null;
    /** Only org owners can open /settings/billing; others get informational copy, no link. */
    canManageBilling: boolean;
}

const noopSubscribe = () => () => {};

export function TrialBanner({ planStatus, trialEndsAt, planName, canManageBilling }: TrialBannerProps) {
    // false during SSR/hydration so the relative time never causes a hydration mismatch.
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

    const state = getTrialBannerState({ planStatus, trialEndsAt });
    if (!state) return null;

    const ended = state.phase === "ended";
    const urgent = ended || state.phase === "ending_soon";
    const trialLabel = planName ? `${planName} trial` : "trial";
    const timeLeft = mounted ? formatDistanceToNow(state.trialEndsAt) : "...";
    const nextStep = canManageBilling
        ? ended
            ? "Check your billing details to keep your plan active."
            : "Review your plan and payment details in billing."
        : "Your organization owner manages billing.";

    return (
        <div
            className={`w-full border-b px-4 py-2.5 flex items-center justify-between gap-4 ${
                urgent ? "bg-destructive/10 border-destructive/20" : "bg-primary/10 border-primary/20"
            }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`p-1.5 rounded-lg ${
                        urgent ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                    }`}
                >
                    {urgent ? <AlertTriangle className="size-4" /> : <Clock className="size-4" />}
                </div>
                <p className="text-sm font-medium text-foreground">
                    {ended ? (
                        <>Your {trialLabel} has ended. {nextStep}</>
                    ) : (
                        <>
                            Your {trialLabel} ends in{" "}
                            <span className={`font-bold ${urgent ? "text-destructive" : "text-primary"}`}>
                                {timeLeft}
                            </span>
                            . {nextStep}
                        </>
                    )}
                </p>
            </div>

            {canManageBilling && (
                <Button
                    asChild
                    size="sm"
                    className={
                        urgent
                            ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground border-none h-8 px-4"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border h-8 px-4"
                    }
                >
                    <Link href="/settings/billing">Manage billing</Link>
                </Button>
            )}
        </div>
    );
}
