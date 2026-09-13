"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function ResetPasswordExpiredSection() {
    return (
        <div className="auth-form-stack">
            <div className="auth-status-icon">
                <ShieldCheck className="text-destructive size-8" />
            </div>
            <div className="auth-form-heading">
                <h1 className="text-2xl font-bold text-foreground">Link expired</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    This password reset link has expired or already been used.
                    <br />
                    Request a new one below.
                </p>
            </div>
            <Link
                href="/forgot-password"
                className="auth-submit"
            >
                Request new reset link
            </Link>
            <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="auth-text-link">
                    Log in
                </Link>
            </p>
        </div>
    );
}
