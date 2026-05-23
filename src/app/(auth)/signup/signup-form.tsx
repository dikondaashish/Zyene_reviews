"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSignupForm } from "./use-signup-form";
import { SignupSuccessSection } from "./signup-success-section";
import { SignupFormFields } from "./signup-form-fields";

export function SignupForm() {
    const signup = useSignupForm();
    const { inviteToken, isSuccess, email, checkingExistingSession, isLoading, handleGoogleSignup } =
        signup;

    if (isSuccess) {
        return <SignupSuccessSection email={email} />;
    }

    if (checkingExistingSession) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
                        ? "You've been invited to a team on Zyene Reviews. Use the same email the invitation was sent to — you won't need to create a new business or pick a plan."
                        : "7-day free trial. No credit card lock-in. Cancel anytime before day 7 and you won't be charged."}
                </p>
            </div>

            <div className="space-y-4">
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="w-full h-12 flex items-center justify-center gap-3 bg-background border border-border rounded-md text-foreground font-medium hover:bg-accent transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="var(--brand-google)"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="var(--google-logo-green)"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="var(--google-logo-yellow)"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="var(--google-logo-red)"
                        />
                    </svg>
                    Sign up with Google
                </button>
                <div className="rounded-lg bg-muted border border-border px-4 py-3">
                    <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">
                            Why Google asks for business access:
                        </span>{" "}
                        Zyene uses your Google Business Profile to sync reviews, post AI replies, and track
                        performance — the core of the product. We never post to Google without your approval and
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
