"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function ResetPasswordExpiredSection() {
    return (
        <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-lg flex items-center justify-center border border-destructive/20">
                <ShieldCheck className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Link expired</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    This password reset link has expired or already been used.
                    <br />
                    Request a new one below.
                </p>
            </div>
            <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center w-full h-12 bg-primary hover:brightness-95 border border-primary text-primary-foreground font-semibold rounded-md transition-all duration-200"
            >
                Request new reset link
            </Link>
            <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="font-semibold text-primary hover:brightness-90 transition-colors">
                    Log in
                </Link>
            </p>
        </div>
    );
}
