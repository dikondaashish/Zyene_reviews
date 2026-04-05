"use client";

import React from "react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * React Error Boundary for catching render errors in the component tree.
 * Wrap around sections of your app to prevent a single component crash
 * from taking down the entire page.
 */
export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Report to Sentry if available
        if (typeof window !== "undefined") {
            import("@sentry/nextjs").then((Sentry) => {
                Sentry.captureException(error, {
                    extra: { componentStack: errorInfo.componentStack },
                });
            });
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
                    <div className="text-destructive">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold">
                        Something went wrong
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        An unexpected error occurred. Please try refreshing the
                        page. If the problem persists, contact support.
                    </p>
                    <button
                        onClick={() =>
                            this.setState({ hasError: false, error: null })
                        }
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
