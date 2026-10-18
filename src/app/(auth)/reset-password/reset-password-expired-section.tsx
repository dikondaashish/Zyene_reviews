"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { AuthHeading } from "@/components/auth/auth-form-ui";

export function ResetPasswordExpiredSection() {
    return (
        <div className="auth-form-stack">
            <div className="auth-status-icon auth-status-icon--warning"><ShieldAlert size={22} aria-hidden="true" /></div>
            <AuthHeading title="This link has expired">
                Password reset links work once and expire after a while. Request a new one and we’ll email it right away.
            </AuthHeading>
            <Link href="/forgot-password" className="auth-submit">
                Request a new link
            </Link>
            <p className="auth-switch">Remember your password?<Link href="/login" className="auth-text-link">Log in</Link></p>
        </div>
    );
}
