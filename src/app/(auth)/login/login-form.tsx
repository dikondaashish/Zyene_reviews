"use client";

import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { GoogleIdentityButton } from "@/components/auth/google-identity-button";
import { useLoginForm } from "./use-login-form";

interface LoginFormProps {
    googleClientId: string;
}

export function LoginForm({ googleClientId }: LoginFormProps) {
    const { isLoading, showPassword, setShowPassword, inviteToken, nextPath, onSubmit } = useLoginForm();

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
                <p className="text-muted-foreground">
                    Enter your credentials to access your dashboard
                </p>
            </div>

            <div className="space-y-4">
                <GoogleIdentityButton
                    clientId={googleClientId}
                    intent="signin"
                    inviteToken={inviteToken}
                    nextPath={nextPath}
                />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs text-muted-foreground uppercase">
                        <span className="bg-background px-3">Or continue with email</span>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            required
                            className="w-full h-12 px-4 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-primary hover:brightness-90 font-medium transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter your password"
                                className="w-full h-12 px-4 pr-12 bg-background border border-input rounded-[5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="size-5" />
                                ) : (
                                    <Eye className="size-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-primary hover:brightness-95 border border-primary text-primary-foreground font-semibold rounded-md transition-[filter,opacity] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading && <Loader2 className="mr-2 animate-spin size-4" />}
                        Sign In
                    </button>
                </form>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:brightness-90 transition-colors">
                    Sign up
                </Link>
            </p>
        </div>
    );
}
