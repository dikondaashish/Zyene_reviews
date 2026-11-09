"use client";

import { toast } from "sonner";
import { resendVerificationEmail } from "@/lib/auth/resend-verification-email";

/** Shows why a campaign status change was refused; offers a working resend for unverified email. */
export function toastCampaignStatusError(body: { error?: string; code?: string } | null | undefined) {
    if (body?.code === "EMAIL_NOT_VERIFIED") {
        toast.error("Email verification required", {
            description: "You must verify your email before activating campaigns.",
            action: { label: "Resend Email", onClick: () => void resendVerificationEmail() },
        });
        return;
    }
    toast.error(body?.error || "Failed to update campaign");
}
