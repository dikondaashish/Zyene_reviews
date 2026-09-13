"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { GoogleIdentityButton } from "@/components/auth/google-identity-button";
import { AuthDivider, AuthHeading } from "@/components/auth/auth-form-ui";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";
import { useSignupForm } from "@/app/(auth)/signup/use-signup-form";
import { SignupSuccessSection } from "@/app/(auth)/signup/signup-success-section";
import { SignupFormFields } from "@/app/(auth)/signup/signup-form-fields";

export function SignupForm({ googleClientId }: { googleClientId: string }) {
    const signup = useSignupForm();
    const { inviteToken, isSuccess, email, checkingExistingSession } = signup;
    if (isSuccess) return <SignupSuccessSection email={email} />;
    if (checkingExistingSession) {
        return <div className="auth-loading" role="status"><Loader2 className="animate-spin" size={20} aria-hidden="true" />Getting things ready…</div>;
    }
    return (
        <div className="auth-form-stack">
            <AuthHeading title={inviteToken ? "Join your team" : "Start something good."}>
                {inviteToken
                    ? "Create your account with the email your team invited. Your workspace will be ready for you."
                    : "Try Zyene Reviews free for 7 days. Cancel before your trial ends to avoid a charge."}
            </AuthHeading>
            <div>
                <GoogleIdentityButton clientId={googleClientId} intent="signup" inviteToken={inviteToken} nextPath="/dashboard" />
                <p className="auth-google-note">Connect your Google Business Profile after creating your account.</p>
            </div>
            <AuthDivider />
            <SignupFormFields {...signup} />
            <p className="auth-switch">Already have an account? <Link
                href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}
                className="auth-text-link">Log in</Link></p>
            <p className="auth-legal">By creating an account, you agree to our{" "}
                <Link href={`${MARKETING_SITE_ORIGIN}/terms`}>Terms of Service</Link> and{" "}
                <Link href={`${MARKETING_SITE_ORIGIN}/privacy`}>Privacy Policy</Link>.
            </p>
        </div>
    );
}
