"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useForgotPasswordForm } from "./use-forgot-password-form";
import { ForgotPasswordSuccessSection } from "./forgot-password-success-section";

export function ForgotPasswordForm() {
    const { email, setEmail, isLoading, isSuccess, handleSubmit } = useForgotPasswordForm();

    if (isSuccess) {
        return <ForgotPasswordSuccessSection email={email} />;
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset password</h1>
                <p className="text-muted-foreground">
                    Enter your email address and we&apos;ll send you a reset link
                </p>
            </div>

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
                    {isLoading && <Loader2 className="mr-2 animate-spin size-4" />}
                    Send Reset Link
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
