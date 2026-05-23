"use client";

import Link from "next/link";
import { Loader2, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { SignupFormPhoneFields } from "./signup-form-phone-fields";
import type { useSignupForm } from "./use-signup-form";

type SignupFormFieldsProps = ReturnType<typeof useSignupForm>;

export function SignupFormFields(props: SignupFormFieldsProps) {
    const {
        fullName,
        setFullName,
        phone,
        setPhone,
        email,
        setEmail,
        password,
        setPassword,
        smsReviewAlertsConsent,
        setSmsReviewAlertsConsent,
        showPassword,
        setShowPassword,
        isLoading,
        handleSubmit,
    } = props;

    return (
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

            <SignupFormPhoneFields
                phone={phone}
                setPhone={setPhone}
                smsReviewAlertsConsent={smsReviewAlertsConsent}
                setSmsReviewAlertsConsent={setSmsReviewAlertsConsent}
                isLoading={isLoading}
            />

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
                    <Mail className="size-3" /> We use this for critical dashboard alerts and secure access.
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
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 px-1">
                    <ShieldCheck className="size-3" /> Help us protect your business with a strong, unique
                    password.
                </p>
                <PasswordStrengthIndicator password={password} />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:brightness-95 border border-primary text-primary-foreground font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading && <Loader2 className="mr-2 animate-spin size-4" />}
                Create Account
            </button>
        </form>
    );
}
