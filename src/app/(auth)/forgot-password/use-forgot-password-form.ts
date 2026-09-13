"use client";

import { useState } from "react";
import { createClient } from "@/lib/db/supabase/client";
import {
    isSupabaseEmailSendRateLimited,
} from "@/lib/auth/supabase-email-rate-limit";

export function useForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isLoading) return;
        setFormError(null);
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
            });
            if (error) {
                setFormError(isSupabaseEmailSendRateLimited(error)
                    ? "Too many reset emails have been requested. Please wait before requesting another link."
                    : "We couldn’t send the reset link. Please try again in a moment.");
            } else {
                setIsSuccess(true);
            }
        } catch {
            setFormError("We couldn’t connect. Check your connection and try again.");
        }
        setIsLoading(false);
    }

    return {
        formError,
        email,
        setEmail,
        isLoading,
        isSuccess,
        handleSubmit,
    };
}
