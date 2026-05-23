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
        setIsLoading(true);

        const supabase = createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
        });

        if (error) {
            if (isSupabaseEmailSendRateLimited(error)) {
                toastAuthEmailRateLimit(toast);
            } else {
                toast.error(error.message);
            }
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
    }

    return {
        email,
        setEmail,
        isLoading,
        isSuccess,
        handleSubmit,
    };
}
