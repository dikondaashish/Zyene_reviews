"use client";

import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useResetPasswordForm } from "@/app/(auth)/reset-password/use-reset-password-form";
import { ResetPasswordExpiredSection } from "@/app/(auth)/reset-password/reset-password-expired-section";
import { ResetPasswordSuccessSection } from "@/app/(auth)/reset-password/reset-password-success-section";

export function ResetPasswordForm() {
    const {
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
    } = useResetPasswordForm();

    if (sessionError) {
        return <ResetPasswordExpiredSection />;
    }

    if (isSuccess) {
        return <ResetPasswordSuccessSection />;
    }

    return (
        <div className="auth-form-stack">
            <div className="auth-form-heading">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Set new password</h1>
                <p className="text-muted-foreground">Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-fields">
                <div className="auth-field">
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                        New password
                    </label>
                    <div className="auth-password">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading || !sessionReady}
                            autoComplete="new-password"
                            className="auth-input pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                            className="auth-password-toggle"

                        >
                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                    </div>
                </div>

                <div className="auth-field">
                    <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-foreground"
                    >
                        Confirm new password
                    </label>
                    <div className="auth-password">
                        <input
                            id="confirm-password"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Repeat your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading || !sessionReady}
                            autoComplete="new-password"
                            className="auth-input pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        aria-pressed={showConfirm}
                            className="auth-password-toggle"

                        >
                            {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !sessionReady}
                    className="auth-submit"
                >
                    {isLoading && <Loader2 className="mr-2 animate-spin size-4" />}
                    {!sessionReady && !sessionError ? "Verifying link…" : "Update password"}
                </button>
            </form>

            <p className="auth-switch">
                Remember your password?{" "}
                <Link
                    href="/login"
                    className="auth-text-link"
                >
                    Log in
                </Link>
            </p>
        </div>
    );
}
