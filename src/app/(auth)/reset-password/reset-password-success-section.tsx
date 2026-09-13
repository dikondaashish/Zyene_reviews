"use client";

import { CheckCircle2 } from "lucide-react";

export function ResetPasswordSuccessSection() {
    return (
        <div className="auth-form-stack">
            <div className="auth-status-icon">
                <CheckCircle2 className="text-primary size-8" />
            </div>
            <div className="auth-form-heading">
                <h1 className="text-2xl font-bold text-foreground">Password updated</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Your password has been changed successfully.
                    <br />
                    Redirecting you to the dashboard…
                </p>
            </div>
        </div>
    );
}
