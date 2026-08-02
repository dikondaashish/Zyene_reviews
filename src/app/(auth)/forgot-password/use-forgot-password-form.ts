"use client";

import { useState } from "react";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";
import {
    isSupabaseEmailSendRateLimited,
    toastAuthEmailRateLimit,
} from "@/lib/auth/supabase-email-rate-limit";

export function useForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
            });
            if (error) {
                if (isSupabaseEmailSendRateLimited(error)) toastAuthEmailRateLimit(toast);
                else toast.error(error.message);
                return;
            }
            setIsSuccess(true);
        } catch {
            toast.error("Unable to send a password reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return {
        email,
        setEmail,
        isLoading,
        isSuccess,
        handleSubmit,
    };
}
