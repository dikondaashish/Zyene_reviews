"use client";

import Link from "next/link";
import { GoogleIdentityButton } from "@/components/auth/google-identity-button";
import { AuthDivider, AuthError, AuthHeading, AuthPasswordField, AuthSubmit } from "@/components/auth/auth-form-ui";
import { useLoginForm } from "@/app/(auth)/login/use-login-form";

export function LoginForm({ googleClientId }: { googleClientId: string }) {
    const { isLoading, showPassword, setShowPassword, inviteToken, nextPath, onSubmit, formError } = useLoginForm();
    const signupQuery = new URLSearchParams({ next: nextPath });
    if (inviteToken) signupQuery.set("invite", inviteToken);
    return (
        <div className="auth-form-stack">
            <AuthHeading title="Welcome back">Log in to your workspace. Your next great customer conversation starts here.</AuthHeading>
            <GoogleIdentityButton clientId={googleClientId} intent="signin" inviteToken={inviteToken} nextPath={nextPath} />
            <AuthDivider />
            <form onSubmit={onSubmit} className="auth-fields" aria-busy={isLoading}>
                <AuthError message={formError} />
                <div className="auth-field">
                    <label htmlFor="email">Email address</label>
                    <input id="email" name="email" placeholder="you@business.com" type="email"
                        autoCapitalize="none" autoComplete="email" autoCorrect="off" required
                        disabled={isLoading} className="auth-input" />
                </div>
                <div className="auth-field">
                    <div className="auth-label-row">
                        <label htmlFor="password">Password</label>
                        <Link href="/forgot-password" className="auth-text-link">Forgot password?</Link>
                    </div>
                    <AuthPasswordField id="password" name="password" required autoComplete="current-password"
                        placeholder="Enter your password" disabled={isLoading}
                        visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                </div>
                <AuthSubmit loading={isLoading} pending="Logging in…">Log in</AuthSubmit>
            </form>
            <p className="auth-switch">New to Zyene Reviews? <Link href={`/signup?${signupQuery}`} className="auth-text-link">Create an account</Link></p>
        </div>
    );
}
