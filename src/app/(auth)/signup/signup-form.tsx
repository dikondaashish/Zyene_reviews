"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { GoogleIdentityButton } from "@/components/auth/google-identity-button";
import { useSignupForm } from "./use-signup-form";
import { SignupSuccessSection } from "./signup-success-section";
import { SignupFormFields } from "./signup-form-fields";

interface SignupFormProps {
    googleClientId: string;
}

export function SignupForm({ googleClientId }: SignupFormProps) {
    const signup = useSignupForm();
    const { inviteToken, isSuccess, email, checkingExistingSession } = signup;

    if (isSuccess) {
        return <SignupSuccessSection email={email} />;
    }

    if (checkingExistingSession) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary size-6" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {inviteToken ? "Join your team" : "Start your free trial"}
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                    {inviteToken
                        ? "You've been invited to a team on Zyene Reviews. Use the same email the invitation was sent to; you won't need to create a new business or pick a plan."
                        : "7-day free trial. No credit card lock-in. Cancel anytime before day 7 and you won't be charged."}
                </p>
            </div>

            <div className="space-y-4">
                <GoogleIdentityButton
                    clientId={googleClientId}
                    intent="signup"
                    inviteToken={inviteToken}
                    nextPath="/dashboard"
                />
                <div className="rounded-lg bg-muted border border-border px-4 py-3">
                    <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">
                            Why Google asks for business access:
                        </span>{" "}
                        Zyene uses your Google Business Profile to sync reviews, post AI replies, and track
                        performance—the core of the product. We never post to Google without your approval and
                        never share your data with third parties.
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                        No phone number needed for Google sign-up. Add it later under{" "}
                        <Link
                            href="/settings/notifications"
                            className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                        >
                            Settings → Notifications
                        </Link>{" "}
                        if you want SMS review alerts.
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs text-muted-foreground uppercase">
                        <span className="bg-background px-3">Or continue with email</span>
                    </div>
                </div>

                <SignupFormFields {...signup} />
            </div>

            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-primary hover:brightness-90 transition-colors"
                >
                    Log in
                </Link>
            </p>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground transition-colors">
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
    );
}
