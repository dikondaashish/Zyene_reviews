"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import { isPlausibleMobileNumber } from "@/lib/validations/phone";
import {
    isSupabaseEmailSendRateLimited,
} from "@/lib/auth/supabase-email-rate-limit";
import { useSignupSession } from "./use-signup-session";
import { trackSignupEvent } from "@/lib/analytics/signup-events";

export function useSignupForm() {
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [smsReviewAlertsConsent, setSmsReviewAlertsConsent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const { checkingExistingSession } = useSignupSession(inviteToken);
    // New owners give a mobile number; team members joining by invite don't have to.
    const phoneRequired = !inviteToken;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isLoading) return;
        setFormError(null);

        if (password.length < 8) {
            setFormError("Use a password with at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setFormError("The two passwords don't match. Type the same password in both boxes.");
            return;
        }

        const phoneTrimmed = phone.trim();
        if (phoneRequired && !phoneTrimmed) {
            setFormError("Add your mobile number, including your country code, for example +1 555 123 4567.");
            return;
        }
        if (phoneTrimmed && !isPlausibleMobileNumber(phoneTrimmed)) {
            setFormError("Check your mobile number. Include your country code, for example +1 555 123 4567.");
            return;
        }

        setIsLoading(true);
        try {
            const supabase = createClient();
            const callbackUrl = new URL("/api/auth/callback", window.location.origin);
            if (inviteToken) callbackUrl.searchParams.set("invite", inviteToken);

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        ...(phoneTrimmed ? { phone: phoneTrimmed } : {}),
                        sms_review_alerts_consent: smsReviewAlertsConsent,
                        ...(inviteToken ? { invite_token: inviteToken } : {}),
                    },
                    emailRedirectTo: callbackUrl.toString(),
                },
            });

            if (error) {
                if (isSupabaseEmailSendRateLimited(error)) {
                    setFormError("Too many emails have been requested. Wait a while before trying again, or sign up with Google.");
                } else {
                    setFormError(error.message);
                }
            } else {
                setIsSuccess(true);
                if (!inviteToken) trackSignupEvent("signup_verification_requested", "email");
            }
        } catch {
            setFormError("We couldn’t create your account. Check your connection and try again.");
        }
        setIsLoading(false);
    }

    return {
        formError,
        inviteToken,
        fullName,
        setFullName,
        email,
        setEmail,
        phone,
        setPhone,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        phoneRequired,
        smsReviewAlertsConsent,
        setSmsReviewAlertsConsent,
        showPassword,
        setShowPassword,
        isLoading,
        isSuccess,
        checkingExistingSession,
        handleSubmit,
        trackStart: () => { if (!inviteToken) trackSignupEvent("signup_started", "email"); },
    };
}
