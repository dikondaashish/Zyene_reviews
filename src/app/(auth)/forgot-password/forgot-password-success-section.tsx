"use client";

import { MailCheck } from "lucide-react";
import { AuthBackToLogin, AuthHeading } from "@/components/auth/auth-form-ui";

export function ForgotPasswordSuccessSection({ email }: { email: string }) {
    return (
        <div className="auth-form-stack" role="status">
            <div className="auth-status-icon auth-status-icon--success"><MailCheck size={22} aria-hidden="true" /></div>
            <AuthHeading title="Check your inbox">
                If an account exists for <span className="auth-status-email">{email}</span>, we’ve sent a link to reset your password.
            </AuthHeading>
            <p className="auth-note">The link works once. Nothing after a few minutes? Check your spam folder.</p>
            <AuthBackToLogin />
        </div>
    );
}
