"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/db/supabase/client";
import { AuthBackToLogin, AuthError, AuthHeading } from "@/components/auth/auth-form-ui";

export function SignupSuccessSection({ email }: { email: string }) {
    const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
    async function resend() {
        if (resendState === "sending" || resendState === "sent") return;
        setResendState("sending");
        try {
            const { error } = await createClient().auth.resend({ type: "signup", email });
            setResendState(error ? "error" : "sent");
        } catch {
            setResendState("error");
        }
    }
    return (
        <div className="auth-form-stack">
            <div className="auth-status-icon"><MailCheck size={22} aria-hidden="true" /></div>
            <AuthHeading title="Check your inbox">
                We sent a verification link to <span className="auth-status-email">{email}</span>.
            </AuthHeading>
            <ol className="auth-steps">
                <li>Open the email from Zyene Reviews. Check spam if you don’t see it.</li>
                <li>Select “Confirm your account” to continue to your workspace.</li>
            </ol>
            <AuthError message={resendState === "error" ? "We couldn’t resend the email. Please wait a moment and try again." : null} />
            <p className="auth-hint">
                Didn’t get it?{" "}
                <button type="button" onClick={resend} className="auth-text-link"
                    disabled={resendState === "sending" || resendState === "sent"}>
                    {resendState === "sending" ? "Sending…" : resendState === "sent" ? "Sent. Check your inbox" : "Resend email"}
                </button>
                <span className="sr-only" role="status">{resendState === "sent" ? "Verification email sent. Check your inbox." : ""}</span>
            </p>
            <AuthBackToLogin />
        </div>
    );
}
