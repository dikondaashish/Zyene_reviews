"use client";

import Link from "next/link";
import { GoogleIdentityButton } from "@/components/auth/google-identity-button";
import { AuthDivider, AuthHeading } from "@/components/auth/auth-form-ui";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";
import { useSignupForm } from "@/app/(auth)/signup/use-signup-form";
import { SignupSuccessSection } from "@/app/(auth)/signup/signup-success-section";
import { SignupFormFields } from "@/app/(auth)/signup/signup-form-fields";

export function SignupForm({ googleClientId }: { googleClientId: string }) {
    const signup = useSignupForm();
    const { inviteToken, isSuccess, email, checkingExistingSession } = signup;
    if (isSuccess) return <SignupSuccessSection email={email} />;
    if (checkingExistingSession) return <AuthFormSkeleton fields={3} />;
    return (
        <div className="auth-form-stack">
            <AuthHeading title={inviteToken ? "Join your team" : "Create your account"}>
                {inviteToken
                    ? "Sign up with the email your team invited. Your workspace is ready for you."
                    : "7-day trial on eligible new plans. Card required; your plan bills automatically unless you cancel in Billing."}
            </AuthHeading>
            <div className="auth-sso">
                <GoogleIdentityButton clientId={googleClientId} intent="signup" inviteToken={inviteToken} nextPath="/dashboard" />
                <p className="auth-google-note">You’ll connect your Google Business Profile after sign-up.</p>
            </div>
            <AuthDivider />
            <SignupFormFields {...signup} />
            <p className="auth-legal">By creating an account, you agree to our{" "}
                <Link href={`${MARKETING_SITE_ORIGIN}/terms`}>Terms of Service</Link> and{" "}
                <Link href={`${MARKETING_SITE_ORIGIN}/privacy`}>Privacy Policy</Link>.
            </p>
            <p className="auth-switch">Already have an account?<Link
                href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}
                className="auth-text-link">Log in</Link></p>
        </div>
    );
}
