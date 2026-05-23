"use client";

import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPasswordSuccessSection({ email }: { email: string }) {
    return (
        <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-secondary rounded-lg flex items-center justify-center border border-border">
                <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    If an account exists for{" "}
                    <span className="font-medium text-foreground">{email}</span>,
                    <br />
                    we&apos;ve sent a password reset link.
                </p>
            </div>
            <Link href="/login">
                <button className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:brightness-90 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                </button>
            </Link>
        </div>
    );
}
