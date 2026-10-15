"use client";

import Link from "next/link";
import { AuthHeading, AuthPasswordField, AuthSubmit } from "@/components/auth/auth-form-ui";
import { useResetPasswordForm } from "@/app/(auth)/reset-password/use-reset-password-form";
import { ResetPasswordExpiredSection } from "@/app/(auth)/reset-password/reset-password-expired-section";
import { ResetPasswordSuccessSection } from "@/app/(auth)/reset-password/reset-password-success-section";

export function ResetPasswordForm() {
    const {
        password, setPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword,
        showConfirm, setShowConfirm, isLoading, isSuccess, sessionReady, sessionError, handleSubmit,
    } = useResetPasswordForm();

    if (sessionError) return <ResetPasswordExpiredSection />;
    if (isSuccess) return <ResetPasswordSuccessSection />;

    const disabled = isLoading || !sessionReady;
    return (
        <div className="auth-form-stack">
            <AuthHeading title="Set a new password">Choose a strong password you don’t use anywhere else.</AuthHeading>
            <form onSubmit={handleSubmit} className="auth-fields" aria-busy={isLoading}>
                <div className="auth-field">
                    <label htmlFor="password">New password</label>
                    <AuthPasswordField id="password" placeholder="Minimum 6 characters" value={password}
                        onChange={(e) => setPassword(e.target.value)} required disabled={disabled}
                        autoComplete="new-password" visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                </div>
                <div className="auth-field">
                    <label htmlFor="confirm-password">Confirm new password</label>
                    <AuthPasswordField id="confirm-password" placeholder="Repeat your new password" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} required disabled={disabled}
                        autoComplete="new-password" visible={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                </div>
                <AuthSubmit loading={isLoading} pending="Updating password…" disabled={!sessionReady}>
                    {sessionReady ? "Update password" : "Verifying link…"}
                </AuthSubmit>
            </form>
            <p className="auth-switch">Remember your password? <Link href="/login" className="auth-text-link">Log in</Link></p>
        </div>
    );
}
