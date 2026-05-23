"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stepBusinessLocationSchema, type StepBusinessLocationFormData } from "@/lib/validations/onboarding";
import type { OnboardingGoogleLocationInfo } from "@/types/components";
import type { Step2FormProps, GoogleConnectionState } from "@/components/onboarding/step2-form-types";
import { navigateToGoogleBusinessOAuthOnboarding } from "@/components/onboarding/step2-form-google-oauth-navigate";
import { runStep2SaveAndNext, runStep2Skip } from "@/components/onboarding/step2-form-save-navigation";
import { useStep2GoogleConnection } from "@/components/onboarding/use-step2-google-connection";

export function useStep2FormController({
    onNext,
    onSkip,
    businessId,
    businessName,
    city,
    address = "",
    state: stateProp = "",
    phone = "",
    pendingGoogleCode,
    onGoogleCodeConsumed,
    onBusinessUpdate,
    initialConnected = false,
}: Step2FormProps) {
    const [mounted, setMounted] = useState(false);
    const [googleState, setGoogleState] = useState<GoogleConnectionState>({ status: "idle" });

    const form = useForm<StepBusinessLocationFormData>({
        resolver: zodResolver(stepBusinessLocationSchema),
        defaultValues: {
            businessName: businessName || "",
            locationName: businessName || "",
            address: address || "",
            city: city || "",
            state: stateProp || "CA",
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
            state: stateProp || "CA",
            phone: phone || "",
        });
    }, [businessName, city, address, stateProp, phone, form]);

    const watchedBusinessName = form.watch("businessName");
    useEffect(() => {
        form.setValue("locationName", watchedBusinessName || "");
    }, [watchedBusinessName, form]);

    const [advancing, setAdvancing] = useState(false);

    const updateFormAndParent = (
        info: OnboardingGoogleLocationInfo,
        reviews?: { reviewCount?: number; averageRating?: number }
    ) => {
        const newBusinessName = info.businessName || form.getValues("businessName");
        const newAddress = info.address || form.getValues("address");
        const newCity = info.city || form.getValues("city");
        const newState = info.state || form.getValues("state");
        const newPhone = info.phone || form.getValues("phone");

        form.reset({
            businessName: newBusinessName,
            locationName: newBusinessName,
            address: newAddress,
            city: newCity,
            state: newState,
            phone: newPhone,
        });

        onBusinessUpdate?.({
            name: newBusinessName,
            address_line1: newAddress,
            city: newCity,
            state: newState,
            category: info.category || null,
        });
    };

    const google = useStep2GoogleConnection({
        businessId,
        initialConnected,
        pendingGoogleCode,
        onGoogleCodeConsumed,
        mounted,
        googleState,
        setGoogleState,
        updateFormAndParent,
        setAdvancing,
    });

    const handleConnectClick = () => navigateToGoogleBusinessOAuthOnboarding();

    const onSaveAndNext = async () => {
        setAdvancing(true);
        try {
            await runStep2SaveAndNext(businessId, () => form.getValues(), onNext);
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
        googleState,
        setGoogleState,
        form,
        advancing,
        availableLocations: google.availableLocations,
        handleSelection: google.handleSelection,
        handleConnectClick,
        onSaveAndNext,
        handleSkip,
        updateFormAndParent,
    };
}
