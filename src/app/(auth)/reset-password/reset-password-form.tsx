"use client";

import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useResetPasswordForm } from "./use-reset-password-form";
import { ResetPasswordExpiredSection } from "./reset-password-expired-section";
import { ResetPasswordSuccessSection } from "./reset-password-success-section";

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
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Set new password</h1>
                <p className="text-muted-foreground">Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

                <div className="space-y-1.5">
                    <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-foreground"
                    >
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
