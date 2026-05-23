"use client";

import { CheckCircle2 } from "lucide-react";

export function ResetPasswordSuccessSection() {
    return (
        <div className="space-y-6 text-center">
            <div className="mx-auto bg-secondary rounded-lg flex items-center justify-center border border-border size-16">
                <CheckCircle2 className="text-primary size-8" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Password updated</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Your password has been changed successfully.
                    <br />
                    Redirecting you to the dashboard…
                </p>
            </div>
        </div>
    );
}
