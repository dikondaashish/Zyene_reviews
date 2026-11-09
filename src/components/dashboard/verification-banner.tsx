"use client";

import { Mail, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AppUserSummary } from "@/types/components";
import { resendVerificationEmail } from "@/lib/auth/resend-verification-email";

export function VerificationBanner({ user }: { user: AppUserSummary }) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isResending, setIsResending] = useState(false);

    if (isDismissed || user?.email_confirmed_at) return null;

    const resendVerification = async () => {
        if (isResending) return;
        setIsResending(true);
        try {
            await resendVerificationEmail(user.email);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="bg-primary text-primary-foreground py-3 px-4 flex items-center justify-between gap-4 z-50">
            <div className="flex items-center gap-3">
                <div className="bg-primary/80 rounded-full p-1.5 hidden md:block">
                    <Mail className="size-4" />
                </div>
                <div className="text-sm font-medium">
                    <span className="opacity-90">Please verify your email address (</span>
                    <span className="font-bold underline decoration-primary-foreground/40">{user.email}</span>
                    <span className="opacity-90">) to unlock all features, including campaign sending.</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resendVerification}
                    disabled={isResending}
                    className="h-8 text-xs bg-primary/80 hover:bg-primary/70 text-primary-foreground border-none"
                >
                    {isResending ? "Sending..." : "Resend Link"}
                </Button>
                <button 
                    type="button"
                    onClick={() => setIsDismissed(true)}
                    className="p-1 hover:bg-primary/80 rounded-lg transition-colors"
                    aria-label="Dismiss verification reminder"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
