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
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSessionReady(true);
            } else {
                setSessionError(true);
            }
        });
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        const supabase = createClient();

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
        setTimeout(() => router.push("/dashboard"), 2500);
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
