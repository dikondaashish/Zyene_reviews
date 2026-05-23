"use client";

import { CheckCircle2 } from "lucide-react";

export function ResetPasswordSuccessSection() {
    return (
        <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-secondary rounded-lg flex items-center justify-center border border-border">
                <CheckCircle2 className="h-8 w-8 text-primary" />
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
