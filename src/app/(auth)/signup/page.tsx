"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/db/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck, Mail, Phone } from "lucide-react";
import { isPlausibleMobileNumber } from "@/lib/validations/phone";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { useSearchParams } from "next/navigation";
import {
    isSupabaseEmailSendRateLimited,
    toastAuthEmailRateLimit,
} from "@/lib/auth/supabase-email-rate-limit";

function SignupForm() {
    const searchParams = useSearchParams();
    const inviteToken = searchParams.get("invite");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [smsReviewAlertsConsent, setSmsReviewAlertsConsent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [checkingExistingSession, setCheckingExistingSession] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function handleExistingSession() {
            const supabase = createClient();
            const { data } = await supabase.auth.getUser();
            const user = data.user;

            if (!user) {
                if (!cancelled) setCheckingExistingSession(false);
                return;
            }

            // Already signed in: if this is an invite link, accept it and go to app.
            if (inviteToken) {
                try {
                    const acceptRes = await fetch("/api/team/accept-invite", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: inviteToken }),
                    });
                    if (!acceptRes.ok) {
                        const payload = (await acceptRes.json().catch(() => ({}))) as { error?: string };
                        toast.error("Invite acceptance failed", {
                            description: payload?.error || "Please ask for a new invite.",
                        });
                    }
                } catch {
                    toast.error("Invite acceptance failed");
                }
            }

            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            const protocol = rootDomain.includes("localhost") ? "http" : "https";
            window.location.href = `${protocol}://app.${rootDomain}/dashboard`;
        }

        void handleExistingSession();
        return () => {
            cancelled = true;
        };
    }, [inviteToken]);

    async function handleGoogleSignup() {
        setIsLoading(true);
        const supabase = createClient();
        const callbackUrl = new URL("/api/auth/callback", window.location.origin);
        if (inviteToken) callbackUrl.searchParams.set("invite", inviteToken);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: callbackUrl.toString(),
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
                // We request GBP scope early to streamline onboarding
                scopes: "https://www.googleapis.com/auth/business.manage",
            },
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        const phoneTrimmed = phone.trim();
        if (!isPlausibleMobileNumber(phoneTrimmed)) {
            toast.error("Enter a valid mobile number with country code (e.g. +1 555 123 4567).");
            setIsLoading(false);
            return;
        }

        const supabase = createClient();
        const callbackUrl = new URL("/api/auth/callback", window.location.origin);
        if (inviteToken) callbackUrl.searchParams.set("invite", inviteToken);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phoneTrimmed,
                    sms_review_alerts_consent: smsReviewAlertsConsent,
                    ...(inviteToken ? { invite_token: inviteToken } : {}),
                },
                emailRedirectTo: callbackUrl.toString(),
            },
        });

        if (error) {
            if (isSupabaseEmailSendRateLimited(error)) {
                toastAuthEmailRateLimit(toast);
            } else {
                toast.error(error.message);
            }
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-secondary rounded-lg flex items-center justify-center border border-border">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We&apos;ve sent a confirmation link to{" "}
                        <span className="font-medium text-foreground">{email}</span>.
                        <br />
                        Click the link to activate your account.
                    </p>
                </div>
                <Link href="/login">
                    <button className="mt-2 text-sm font-medium text-primary hover:brightness-90 transition-colors">
                        ← Back to Login
                    </button>
                </Link>
            </div>
        );
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
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Create an account
                </h1>
                <p className="text-muted-foreground">
                    {inviteToken ?
                        "You have been invited to a team. Use the same email the invitation was sent to—you will not need to create a new business or pick a plan."
                    :   "Start managing your business reviews in minutes"}
                </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                    className="w-full h-12 flex items-center justify-center gap-3 bg-background border border-border rounded-md text-foreground font-medium hover:bg-accent transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="var(--brand-google)" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="var(--google-logo-green)" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="var(--google-logo-yellow)" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="var(--google-logo-red)" />
                    </svg>
                    Sign up with Google
                </button>
                <p className="text-center text-[11px] text-muted-foreground leading-relaxed px-1">
                    Google sign-up doesn&apos;t ask for your phone. After you&apos;re in, add your mobile under{" "}
                    <Link
                        href="/settings/notifications"
                        className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                    >
                        Settings → Notifications
                    </Link>{" "}
                    if you want SMS review alerts. SMS notifications are only sent after you add your phone number and provide consent.
                </p>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs text-muted-foreground uppercase">
                        <span className="bg-background px-3">Or continue with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="John Smith"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="name"
                            className="w-full h-12 px-4 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
                        />
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                             Your name will be visible on your business profile.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                            Mobile number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="+1 555 123 4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="tel"
                            className="w-full h-12 px-4 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
                        />
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                            <Phone className="h-3 w-3 shrink-0" /> Include your country code. Your number is saved to your profile; SMS is only used if you opt in below.
                        </p>

                        <div className="flex items-start gap-3 px-1 pt-1">
                            <input
                                id="smsReviewAlertsConsent"
                                type="checkbox"
                                checked={smsReviewAlertsConsent}
                                onChange={(e) => setSmsReviewAlertsConsent(e.target.checked)}
                                className="mt-1 h-4 w-4 shrink-0 rounded border-input bg-background text-primary focus:ring-ring transition-all"
                            />
                            <label
                                htmlFor="smsReviewAlertsConsent"
                                className="text-xs text-muted-foreground leading-normal select-none cursor-pointer"
                            >
                                I agree to receive SMS review alerts from Zyene Reviews, including messages sent on behalf
                                of businesses using the platform. Consent is not required to use the service. Msg frequency
                                varies. Msg &amp; data rates may apply. Reply STOP to unsubscribe or HELP for help. View our{" "}
                                <Link href="/privacy" className="underline hover:text-foreground text-foreground/90">
                                    Privacy Policy
                                </Link>{" "}
                                and{" "}
                                <Link href="/terms" className="underline hover:text-foreground text-foreground/90">
                                    Terms of Service
                                </Link>
                                .
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="email"
                            className="w-full h-12 px-4 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
                        />
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                            <Mail className="h-3 w-3" /> We use this for critical dashboard alerts and secure access.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-sm font-medium text-foreground">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={isLoading}
                                autoComplete="new-password"
                                className="w-full h-12 px-4 pr-12 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                            <ShieldCheck className="h-3 w-3" /> Help us protect your business with a strong, unique password.
                        </p>
                        <PasswordStrengthIndicator password={password} />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-primary hover:brightness-95 border border-primary text-primary-foreground font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </button>
                </form>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-primary hover:brightness-90 transition-colors"
                >
                    Log in
                </Link>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>
                .
            </p>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <SignupForm />
        </Suspense>
    );
}
