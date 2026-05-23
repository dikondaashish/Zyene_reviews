"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";

export function SignupSuccessSection({ email }: { email: string }) {
    return (
        <div className="text-center space-y-6">
            <div className="mx-auto bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 size-16">
                <CheckCircle2 className="text-primary size-8" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Check your inbox</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    We sent a verification link to{" "}
                    <span className="font-semibold text-foreground">{email}</span>.
                </p>
            </div>

            <div className="text-left bg-muted rounded-xl p-5 space-y-3 border border-border">
                {[
                    {
                        step: "1",
                        text: "Open your email inbox (check Spam/Junk if you don't see it within a minute).",
                    },
                    {
                        step: "2",
                        text: 'Click the "Confirm your account" link in the email from Zyene Reviews.',
                    },
                    {
                        step: "3",
                        text: "You'll be taken directly into your dashboard to connect your Google Business Profile.",
                    },
                ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                        <span className="flex-shrink-0 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5 size-6">
                            {item.step}
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                ))}
            </div>

            <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the email?{" "}
                <button
                    type="button"
                    onClick={async () => {
                        const supabase = createClient();
                        const { error } = await supabase.auth.resend({ type: "signup", email });
                        if (error) {
                            toast.error("Could not resend. Please try again in a moment.");
                        } else {
                            toast.success("Verification email re-sent. Check your inbox.");
                        }
                    }}
                    className="font-medium text-primary hover:brightness-90 transition-colors underline underline-offset-2"
                >
                    Resend verification email
                </button>
            </p>

            <Link href="/login">
                <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    ← Back to Login
                </button>
            </Link>
        </div>
    );
}
