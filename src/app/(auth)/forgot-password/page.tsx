"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
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
            toast.error(error.message);
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-secondary rounded-lg flex items-center justify-center border border-border">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        If an account exists for{" "}
                        <span className="font-medium text-foreground">{email}</span>,
                        <br />
                        we&apos;ve sent a password reset link.
                    </p>
                </div>
                <Link href="/login">
                    <button className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:brightness-90 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Login
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Reset password
                </h1>
                <p className="text-muted-foreground">
                    Enter your email address and we&apos;ll send you a reset link
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="email"
                        className="w-full h-12 px-4 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-primary hover:brightness-95 border border-primary text-primary-foreground font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                </button>
            </form>

            {/* Footer */}
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
