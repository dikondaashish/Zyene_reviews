"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";
import { isPlausibleMobileNumber } from "@/lib/validations/phone";
import {
    isSupabaseEmailSendRateLimited,
    toastAuthEmailRateLimit,
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
    const { checkingExistingSession } = useSignupSession(inviteToken);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        const phoneTrimmed = phone.trim();
        if (phoneTrimmed && !isPlausibleMobileNumber(phoneTrimmed)) {
            toast.error("Enter a valid mobile number with country code (e.g. +1 555 123 4567).");
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
                    toastAuthEmailRateLimit(toast);
                } else {
                    toast.error(error.message);
                }
                return;
            }

            setIsSuccess(true);
        } catch {
            toast.error("Sign-up failed", { description: "Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    return {
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
