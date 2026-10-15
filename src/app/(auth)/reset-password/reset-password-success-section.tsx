"use client";

import { CheckCircle2 } from "lucide-react";
import { AuthHeading } from "@/components/auth/auth-form-ui";

export function ResetPasswordSuccessSection() {
    return (
        <div className="auth-form-stack" role="status">
            <div className="auth-status-icon auth-status-icon--success"><CheckCircle2 size={24} aria-hidden="true" /></div>
            <AuthHeading title="Password updated">Your password has been changed. Taking you to your dashboard…</AuthHeading>
        </div>
    );
}
