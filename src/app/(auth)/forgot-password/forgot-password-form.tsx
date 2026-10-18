"use client";

import { KeyRound } from "lucide-react";
import { AuthBackToLogin, AuthError, AuthHeading, AuthInput, AuthSubmit } from "@/components/auth/auth-form-ui";
import { useForgotPasswordForm } from "@/app/(auth)/forgot-password/use-forgot-password-form";
import { ForgotPasswordSuccessSection } from "@/app/(auth)/forgot-password/forgot-password-success-section";

export function ForgotPasswordForm() {
    const { email, setEmail, isLoading, isSuccess, handleSubmit, formError } = useForgotPasswordForm();
    if (isSuccess) return <ForgotPasswordSuccessSection email={email} />;
    return (
        <div className="auth-form-stack">
            <div className="auth-status-icon"><KeyRound size={22} aria-hidden="true" /></div>
            <AuthHeading title="Forgot your password?">Enter the email you use for Zyene Reviews and we’ll send you a link to choose a new one.</AuthHeading>
            <form onSubmit={handleSubmit} className="auth-fields" aria-busy={isLoading}>
                <AuthError message={formError} />
                <div className="auth-field">
                    <label htmlFor="email">Email address</label>
                    <AuthInput id="email" name="email" type="email" placeholder="you@business.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                        autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
                </div>
                <AuthSubmit loading={isLoading} pending="Sending link…">Send reset link</AuthSubmit>
            </form>
            <p className="auth-note">Log in with Google? You don’t need a password. Use “Continue with Google” on the log in page.</p>
            <AuthBackToLogin />
        </div>
    );
}
