"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { AuthError, AuthHeading, AuthSubmit } from "@/components/auth/auth-form-ui";
import { useForgotPasswordForm } from "@/app/(auth)/forgot-password/use-forgot-password-form";
import { ForgotPasswordSuccessSection } from "@/app/(auth)/forgot-password/forgot-password-success-section";

export function ForgotPasswordForm() {
    const { email, setEmail, isLoading, isSuccess, handleSubmit, formError } = useForgotPasswordForm();
    if (isSuccess) return <ForgotPasswordSuccessSection email={email} />;
    return (
        <div className="auth-form-stack">
            <div className="auth-status-icon"><KeyRound size={24} aria-hidden="true" /></div>
            <AuthHeading title="Forgot your password?">It happens. Enter the email you use for Zyene Reviews and we’ll send you a reset link.</AuthHeading>
            <form onSubmit={handleSubmit} className="auth-fields" aria-busy={isLoading}>
                <AuthError message={formError} />
                <div className="auth-field">
                    <label htmlFor="email">Email address</label>
                    <input id="email" name="email" type="email" placeholder="you@business.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                        autoComplete="email" autoCapitalize="none" autoCorrect="off" className="auth-input" />
                </div>
                <AuthSubmit loading={isLoading} pending="Sending reset link…">Send reset link</AuthSubmit>
            </form>
            <p className="auth-hint">Usually log in with Google? You can keep using Google without a password.</p>
            <Link href="/login" className="auth-text-link inline-flex items-center gap-2 justify-self-start">
                <ArrowLeft size={15} aria-hidden="true" /> Back to log in
            </Link>
        </div>
    );
}
