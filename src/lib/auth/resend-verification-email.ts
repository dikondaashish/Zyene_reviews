"use client";

import { toast } from "sonner";
import { createClient } from "@/lib/db/supabase/client";
import { isSupabaseEmailSendRateLimited, toastAuthEmailRateLimit } from "@/lib/auth/supabase-email-rate-limit";

/**
 * Re-sends the signup confirmation email and reports the outcome as a toast.
 * Uses the signed-in user's address when `email` is not given.
 */
export async function resendVerificationEmail(email?: string | null): Promise<boolean> {
    const supabase = createClient();
    try {
        const address = email || (await supabase.auth.getUser()).data.user?.email;
        if (!address) {
            toast.error("User email not found");
            return false;
        }
        const { error } = await supabase.auth.resend({
            type: "signup",
            email: address,
            options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
        });
        if (error) {
            if (isSupabaseEmailSendRateLimited(error)) toastAuthEmailRateLimit(toast);
            else toast.error(error.message || "Failed to resend verification email");
            return false;
        }
        toast.success("Verification email sent!");
        return true;
    } catch {
        toast.error("Failed to resend verification email");
        return false;
    }
}
