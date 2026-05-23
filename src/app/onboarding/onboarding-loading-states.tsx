"use client";

import { Loader2 } from "lucide-react";

export function OnboardingLoadError({ message }: { message: string }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <svg
                    className="w-7 h-7 text-destructive"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">Something went wrong</p>
            <p className="text-sm text-muted-foreground max-w-md">{message}</p>
            <button
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                onClick={() => window.location.reload()}
            >
                Try again
            </button>
        </div>
    );
}

export function OnboardingCheckoutVerifying() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">
                    Confirming your subscription…
                </p>
            </div>
        </div>
    );
}

export function OnboardingInitialLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                    <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Setting things up...</p>
            </div>
        </div>
    );
}
