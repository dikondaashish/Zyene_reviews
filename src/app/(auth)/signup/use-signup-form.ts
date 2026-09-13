"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import { isPlausibleMobileNumber } from "@/lib/validations/phone";
import {
    isSupabaseEmailSendRateLimited,
} from "@/lib/auth/supabase-email-rate-limit";
import { useSignupSession } from "./use-signup-session";

export function useSignupForm() {
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [smsReviewAlertsConsent, setSmsReviewAlertsConsent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const { checkingExistingSession } = useSignupSession(inviteToken);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isLoading) return;
        setFormError(null);

        if (password.length < 6) {
            setFormError("Use a password with at least 6 characters.");
            return;
        }

        const phoneTrimmed = phone.trim();
        if (phoneTrimmed && !isPlausibleMobileNumber(phoneTrimmed)) {
            setFormError("Check the mobile number under SMS review alerts. Include your country code, for example +1 555 123 4567.");
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
        smsReviewAlertsConsent,
        setSmsReviewAlertsConsent,
        showPassword,
        setShowPassword,
        isLoading,
        isSuccess,
        checkingExistingSession,
        handleSubmit,
    };
}
