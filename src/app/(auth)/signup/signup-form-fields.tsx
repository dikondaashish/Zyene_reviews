"use client";

import { AuthError, AuthInput, AuthPasswordField, AuthSubmit } from "@/components/auth/auth-form-ui";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { SignupFormPhoneFields } from "@/app/(auth)/signup/signup-form-phone-fields";
import type { useSignupForm } from "@/app/(auth)/signup/use-signup-form";

export function SignupFormFields(props: ReturnType<typeof useSignupForm>) {
    const { fullName, setFullName, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
        showPassword, setShowPassword, isLoading, handleSubmit, formError } = props;
    const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
    return (
        <form onSubmit={handleSubmit} onInput={props.trackStart} className="auth-fields" aria-busy={isLoading}>
            <AuthError message={formError} />
            <div className="auth-field">
                <label htmlFor="fullName">Full name</label>
                <AuthInput id="fullName" name="fullName" type="text" placeholder="First and last name"
                    value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    disabled={isLoading} autoComplete="name" />
            </div>
            <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <AuthInput id="email" name="email" type="email" placeholder="you@business.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading}
                    autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            </div>
            <div className="auth-field">
                <label htmlFor="password">Password</label>
                <AuthPasswordField id="password" name="password" placeholder="At least 8 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                    disabled={isLoading} autoComplete="new-password" aria-describedby="password-help"
                    visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                <PasswordStrengthIndicator id="password-help" password={password} />
            </div>
            <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <AuthPasswordField id="confirmPassword" name="confirmPassword" placeholder="Type it again"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8}
                    disabled={isLoading} autoComplete="new-password" aria-invalid={mismatch || undefined}
                    aria-describedby={mismatch ? "confirm-password-help" : undefined}
                    visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                {mismatch && <p id="confirm-password-help" className="auth-hint" role="alert">Passwords don&apos;t match yet.</p>}
            </div>
            <SignupFormPhoneFields {...props} />
            <AuthSubmit loading={isLoading} pending="Creating account…">Create account</AuthSubmit>
        </form>
    );
}
