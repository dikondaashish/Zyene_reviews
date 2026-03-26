"use client";

import { AlertCircle, ArrowRight, Mail, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";

export function VerificationBanner({ user }: { user: any }) {
    const [isVisible, setIsVisible] = useState(!user?.email_confirmed_at);
    const [isResending, setIsResending] = useState(false);

    if (!isVisible || user?.email_confirmed_at) return null;

    const resendVerification = async () => {
        setIsResending(true);
        const supabase = createClient();
        const { error } = await supabase.auth.resend({
            type: "signup",
            email: user.email,
            options: {
                emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });

        if (error) {
            toast.error("Failed to resend verification email");
        } else {
            toast.success("Verification email sent!");
        }
        setIsResending(false);
    };

    return (
        <div className="bg-orange-600 text-white py-3 px-4 shadow-lg flex items-center justify-between gap-4 z-50">
            <div className="flex items-center gap-3">
                <div className="bg-orange-500 rounded-full p-1.5 hidden md:block">
                    <Mail className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">
                    <span className="opacity-90">Please verify your email address (</span>
                    <span className="font-bold underline decoration-orange-300">{user.email}</span>
                    <span className="opacity-90">) to unlock all features, including campaign sending.</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resendVerification}
                    disabled={isResending}
                    className="h-8 text-xs bg-orange-700 hover:bg-orange-800 text-white border-none"
                >
                    {isResending ? "Sending..." : "Resend Link"}
                </Button>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-orange-700 rounded-lg transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
