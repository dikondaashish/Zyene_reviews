"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { createClient } from "@/lib/db/supabase/client";
import { AuthError, AuthHeading } from "@/components/auth/auth-form-ui";

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
            <div className="auth-status-icon"><MailCheck size={24} aria-hidden="true" /></div>
            <AuthHeading title="Check your inbox">
                We sent a verification link to <span className="auth-status-email">{email}</span>.
            </AuthHeading>
            <ol className="auth-fields auth-hint list-decimal pl-4">
                <li>Open the email from Zyene Reviews. Check your spam folder if you don’t see it.</li>
                <li>Select “Confirm your account” to verify your email and continue to your workspace.</li>
            </ol>
            <AuthError message={resendState === "error" ? "We couldn’t resend the email. Please wait a moment and try again." : null} />
            <div className="auth-hint">
                <p>Didn’t receive it?</p>
                <button type="button" onClick={resend} className="auth-text-link min-h-11"
                    disabled={resendState === "sending" || resendState === "sent"}>
                    {resendState === "sending" ? "Sending…" : resendState === "sent" ? "Verification email sent" : "Resend verification email"}
                </button>
                <span className="sr-only" role="status">{resendState === "sent" ? "Verification email sent. Check your inbox." : ""}</span>
            </div>
            <Link href="/login" className="auth-text-link inline-flex items-center gap-2 justify-self-start">
                <ArrowLeft size={15} aria-hidden="true" /> Back to log in
            </Link>
        </div>
    );
}
