"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingBusiness, OnboardingOrganization, OnboardingUser } from "./onboarding-types";
import { loadOnboardingBusiness } from "./load-onboarding-business";

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

                if (authUser) {
                    setUser(authUser);

                    const { data: member, error: memberErr } = await supabase
                        .from("organization_members")
                        .select("organization_id")
                        .eq("user_id", authUser.id)
                        .maybeSingle();

                    if (memberErr) {
                        setLoadError(memberErr.message);
                        return;
                    }

                    if (member?.organization_id) {
                        const { data: org } = await supabase
                            .from("organizations")
                            .select("id, name")
                            .eq("id", member.organization_id)
                            .single();
                        if (org) setOrganization(org);

                        const { business: biz, googleConnected: hasGoogle } =
                            await loadOnboardingBusiness(supabase, member.organization_id);
                        if (biz) {
                            setBusiness(biz);
                            setGoogleConnected(hasGoogle);
                        }
                    }

                    if (!isStepResolved) {
                        const { data: userData } = await supabase
                            .from("users")
                            .select("onboarding_step")
                            .eq("id", authUser.id)
                            .single();

                        if (userData?.onboarding_step) {
                            setCurrentStep(userData.onboarding_step);
                        }
                        setIsStepResolved(true);
                    }
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
