"use client";

import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthHeading } from "@/components/auth/auth-form-ui";

export function ForgotPasswordSuccessSection({ email }: { email: string }) {
    return (
        <div className="auth-form-stack" role="status">
            <div className="auth-status-icon"><MailCheck size={24} aria-hidden="true" /></div>
            <AuthHeading title="Check your inbox">
                If an account exists for <span className="auth-status-email">{email}</span>, we’ve sent a password reset link.
            </AuthHeading>
            <p className="auth-hint">Open the link in your email to choose a new password. If it hasn’t arrived after a few minutes, check your spam folder.</p>
            <Link href="/login" className="auth-text-link inline-flex items-center gap-2 justify-self-start">
                <ArrowLeft size={15} aria-hidden="true" /> Back to log in
            </Link>
        </div>
    );
}
