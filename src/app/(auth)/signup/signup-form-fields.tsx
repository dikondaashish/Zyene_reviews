"use client";

import { AuthError, AuthPasswordField, AuthSubmit } from "@/components/auth/auth-form-ui";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { SignupFormPhoneFields } from "@/app/(auth)/signup/signup-form-phone-fields";
import type { useSignupForm } from "@/app/(auth)/signup/use-signup-form";

export function SignupFormFields(props: ReturnType<typeof useSignupForm>) {
    const { fullName, setFullName, email, setEmail, password, setPassword,
        showPassword, setShowPassword, isLoading, handleSubmit, formError } = props;
    return (
        <form onSubmit={handleSubmit} className="auth-fields" aria-busy={isLoading}>
            <AuthError message={formError} />
            <div className="auth-field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" type="text" placeholder="Your full name"
                    value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    disabled={isLoading} autoComplete="name" className="auth-input" />
            </div>
            <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" placeholder="you@business.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                    autoComplete="email" autoCapitalize="none" autoCorrect="off" className="auth-input" />
            </div>
            <div className="auth-field">
                <label htmlFor="password">Password</label>
                <AuthPasswordField id="password" name="password" placeholder="Create a password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    disabled={isLoading} autoComplete="new-password" aria-describedby="password-help"
                    visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                <p id="password-help" className="auth-hint">At least 6 characters. A longer, unique password is safer.</p>
                <PasswordStrengthIndicator password={password} />
            </div>
            <SignupFormPhoneFields {...props} />
            <AuthSubmit loading={isLoading} pending="Creating account…">Create account</AuthSubmit>
        </form>
    );
}
