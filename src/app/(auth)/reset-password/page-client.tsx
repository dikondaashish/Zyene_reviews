"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
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
        // Supabase sets a session via the auth callback before redirecting here.
        // Check that we have a valid recovery session.
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

    if (sessionError) {
        return (
            <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-lg flex items-center justify-center border border-destructive/20">
                    <ShieldCheck className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Link expired</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This password reset link has expired or already been used.
                        <br />
                        Request a new one below.
                    </p>
                </div>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center w-full h-12 bg-primary hover:brightness-95 border border-primary text-primary-foreground font-semibold rounded-md transition-all duration-200"
                >
                    Request new reset link
                </Link>
                <p className="text-center text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:brightness-90 transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="space-y-6 text-center">
                <div className="mx-auto w-16 h-16 bg-secondary rounded-lg flex items-center justify-center border border-border">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Password updated</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your password has been changed successfully.
                        <br />
                        Redirecting you to the dashboard…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Set new password
                </h1>
                <p className="text-muted-foreground">
                    Choose a strong password for your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                        New password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading || !sessionReady}
                            autoComplete="new-password"
                            className="w-full h-12 px-4 pr-12 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
                        Confirm new password
                    </label>
                    <div className="relative">
                        <input
                            id="confirm-password"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading || !sessionReady}
                            autoComplete="new-password"
                            className="w-full h-12 px-4 pr-12 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !sessionReady}
                    className="w-full h-12 bg-primary hover:brightness-95 border border-primary text-primary-foreground font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!sessionReady && !sessionError ? "Verifying link…" : "Update password"}
                </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-primary hover:brightness-90 transition-colors"
                >
                    Log in
                </Link>
            </p>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
