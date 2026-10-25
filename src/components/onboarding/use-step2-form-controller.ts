"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stepBusinessLocationSchema, type StepBusinessLocationFormData } from "@/lib/validations/onboarding";
import type { OnboardingGoogleLocationInfo } from "@/types/components";
import type { Step2FormProps, GoogleConnectionState } from "@/components/onboarding/step2-form-types";
import { useGoogleOAuthNavigation } from "@/components/onboarding/use-google-oauth-navigation";
import { runStep2SaveAndNext, runStep2Skip, step2AfterSave } from "@/components/onboarding/step2-form-save-navigation";
import { useStep2GoogleConnection } from "@/components/onboarding/use-step2-google-connection";
import { knownIndustry } from "@/components/onboarding/step3-form-categories";

export function useStep2FormController({
    onNext,
    onSkip,
    businessId,
    businessName,
    city,
    address = "",
    state: stateProp = "",
    country = "US",
    phone = "",
    pendingGoogleCode,
    onGoogleCodeConsumed,
    googleConnectionError,
    onGoogleConnectionErrorConsumed,
    onBusinessUpdate,
    initialConnected = false,
}: Step2FormProps) {
    const [mounted, setMounted] = useState(false);
    const [googleState, setGoogleState] = useState<GoogleConnectionState>({ status: "idle" });
    const visibleGoogleState: GoogleConnectionState =
        googleConnectionError && googleState.status === "idle"
            ? { status: "error", errorMessage: googleConnectionError }
            : googleState;

    const form = useForm<StepBusinessLocationFormData>({
        resolver: zodResolver(stepBusinessLocationSchema),
        defaultValues: {
            businessName: businessName || "",
            locationName: businessName || "",
            address: address || "",
            city: city || "",
            state: stateProp || (country === "US" ? "CA" : ""),
            country: country || "US",
            phone: phone || "",
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        form.reset({
            businessName: businessName || "",
            locationName: businessName || "",
            address: address || "",
            city: city || "",
            state: stateProp || (country === "US" ? "CA" : ""),
            country: country || "US",
            phone: phone || "",
        });
    }, [businessName, city, address, stateProp, country, phone, form]);

    const watchedBusinessName = form.watch("businessName");
    useEffect(() => {
        form.setValue("locationName", watchedBusinessName || "");
    }, [watchedBusinessName, form]);

    const [advancing, setAdvancing] = useState(false);

    const updateFormAndParent = (info: OnboardingGoogleLocationInfo) => {
        const newBusinessName = info.businessName || form.getValues("businessName");
        const newAddress = info.address || form.getValues("address");
        const newCity = info.city || form.getValues("city");
        const newState = info.state || form.getValues("state");
        const newPhone = info.phone || form.getValues("phone");

        form.reset({ businessName: newBusinessName, locationName: newBusinessName, address: newAddress, city: newCity,
            state: newState, country: form.getValues("country") || "US", phone: newPhone });

        const industry = knownIndustry(info.category);
        onBusinessUpdate?.({
            name: newBusinessName,
            address_line1: newAddress,
            city: newCity,
            state: newState,
            category: info.category || null,
            // "other" means Google's category matched no tile: nothing was detected.
            categoryFromGoogle: Boolean(industry && industry !== "other"),
        });
    };

    const google = useStep2GoogleConnection({
        businessId,
        initialConnected,
        pendingGoogleCode,
        onGoogleCodeConsumed,
        mounted,
        googleState: visibleGoogleState,
        setGoogleState,
        updateFormAndParent,
        setAdvancing,
    });

    const { pending: googleRedirectPending, connect: handleConnectClick } = useGoogleOAuthNavigation(businessId);

    const onSaveAndNext = async () => {
        setAdvancing(true);
        try {
            const viaGoogle = initialConnected || visibleGoogleState.status === "success";
            await runStep2SaveAndNext(businessId, () => form.getValues(), step2AfterSave(viaGoogle, form.getValues("category"), onNext, onBusinessUpdate));
        } finally {
            setAdvancing(false);
        }
    };

    const handleSkip = async () => {
        setAdvancing(true);
        try {
            await runStep2Skip(businessId, onSkip);
        } finally {
            setAdvancing(false);
        }
    };

    return {
        mounted,
        googleState: visibleGoogleState,
        setGoogleState,
        form,
        advancing,
        availableLocations: google.availableLocations,
        handleSelection: google.handleSelection,
        handleConnectClick,
        googleRedirectPending,
        onGoogleConnectionErrorConsumed,
        onSaveAndNext,
        handleSkip,
        updateFormAndParent,
    };
}
