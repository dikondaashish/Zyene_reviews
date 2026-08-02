"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";

export function useResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [sessionError, setSessionError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();
        void supabase.auth.getUser()
            .then(({ data: { user } }) => {
                if (cancelled) return;
                if (user) setSessionReady(true);
                else setSessionError(true);
            })
            .catch(() => {
                if (!cancelled) setSessionError(true);
            });
        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isLoading) return;

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                toast.error(error.message);
                return;
            }
            setIsSuccess(true);
            setTimeout(() => router.push("/dashboard"), 2500);
        } catch {
            toast.error("Unable to update your password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return {
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPassword,
        setShowPassword,
        showConfirm,
        setShowConfirm,
        isLoading,
        isSuccess,
        sessionReady,
        sessionError,
        handleSubmit,
    };
}
