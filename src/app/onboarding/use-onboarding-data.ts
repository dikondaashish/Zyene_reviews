"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ONBOARDING_STEP, type OnboardingBusiness, type OnboardingOrganization, type OnboardingUser } from "./onboarding-types";
import { completeOnboardingWorkspaceSetup } from "@/app/actions/onboarding/workspace-recovery";
import { loadOnboardingWorkspace, WORKSPACE_MISSING_MESSAGE } from "./load-onboarding-workspace";

// The load effect can re-run while a repair is still in flight; share one call per tab
// (the server action also holds a per-user lock across tabs and instances).
let repairInFlight: ReturnType<typeof completeOnboardingWorkspaceSetup> | null = null;
function repairWorkspaceOnce() {
    repairInFlight ??= completeOnboardingWorkspaceSetup().finally(() => {
        repairInFlight = null;
    });
    return repairInFlight;
}

type UseOnboardingDataArgs = {
    supabase: SupabaseClient;
    setUser: (user: OnboardingUser | null) => void;
    setOrganization: (org: OnboardingOrganization | null) => void;
    setBusiness: (biz: OnboardingBusiness | null) => void;
    setGoogleConnected: (connected: boolean) => void;
    setLoadError: (error: string | null) => void;
    setCurrentStep: (step: number) => void;
    setIsStepResolved: (resolved: boolean) => void;
    isStepResolved: boolean;
    user: OnboardingUser | null;
};

export function useOnboardingData({
    supabase,
    setUser,
    setOrganization,
    setBusiness,
    setGoogleConnected,
    setLoadError,
    setCurrentStep,
    setIsStepResolved,
    isStepResolved,
    user,
}: UseOnboardingDataArgs) {
    const router = useRouter();

    useEffect(() => {
        const loadUserAndOrg = async () => {
            try {
                setLoadError(null);
                const {
                    data: { user: authUser },
                    error: userErr,
                } = await supabase.auth.getUser();

                if (userErr) {
                    setLoadError(userErr.message);
                    return;
                }

                if (!authUser) {
                    setLoadError("Your session has ended. Sign in again to finish setting up.");
                    return;
                }
                const { data: userData } = await supabase
                    .from("users")
                    .select("onboarding_step, phone")
                    .eq("id", authUser.id)
                    .single();
                setUser({ ...authUser, phone: userData?.phone ?? null });

                let workspace = await loadOnboardingWorkspace(supabase, authUser.id);
                if (workspace.ok && (!workspace.organization || !workspace.business)) {
                    // Signed in but setup never finished: complete it instead of spinning forever.
                    const repair = await repairWorkspaceOnce();
                    if (!repair.success) {
                        setLoadError(repair.error);
                        return;
                    }
                    workspace = await loadOnboardingWorkspace(supabase, authUser.id);
                }
                if (!workspace.ok) {
                    setLoadError(workspace.error);
                    return;
                }
                if (!workspace.organization || !workspace.business) {
                    setLoadError(WORKSPACE_MISSING_MESSAGE);
                    return;
                }
                setBusiness(workspace.business);
                setGoogleConnected(workspace.googleConnected);
                setOrganization(workspace.organization);

                if (!isStepResolved) {
                    // About you comes first, and again for anyone still missing a mobile number.
                    const stored = userData?.onboarding_step ?? 0;
                    const missingPhone = !userData?.phone?.trim() && stored < ONBOARDING_STEP.done;
                    setCurrentStep(stored <= ONBOARDING_STEP.about || missingPhone ? ONBOARDING_STEP.about : stored);
                    setIsStepResolved(true);
                }
            } catch (err: unknown) {
                setLoadError(
                    err instanceof Error ? err.message : "Failed to load onboarding state"
                );
            }
        };

        loadUserAndOrg();
    }, [
        supabase,
        isStepResolved,
        setCurrentStep,
        setUser,
        setOrganization,
        setBusiness,
        setGoogleConnected,
        setLoadError,
        setIsStepResolved,
    ]);

    useEffect(() => {
        const checkOnboarding = async () => {
            if (!user) return;

            const { data } = await supabase
                .from("users")
                .select("onboarding_completed")
                .eq("id", user.id)
                .single();

            if (data?.onboarding_completed) {
                router.push("/dashboard");
            }
        };

        checkOnboarding();
    }, [user, supabase, router]);
}
