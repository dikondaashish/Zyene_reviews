import Link from "next/link";
import { Star, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { Suspense } from "react";
import { UtmCapture } from "@/components/marketing/utm-capture";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen min-w-0 overflow-x-clip bg-background text-foreground">
            {/* Left Branded Panel — espresso band uses marketing tokens so it stays on-brand in light + dark */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[color:var(--marketing-footer-bg)] flex-col justify-between p-12 text-[color:var(--marketing-footer-fg)]">
                {/* Background pattern */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, var(--marketing-footer-fg) 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Gradient orbs */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-0 w-60 h-60 bg-primary/15 rounded-full blur-[80px]" />

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary border border-primary">
                            <Star className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-[color:var(--marketing-footer-fg)]">
                            <span className="text-primary">Zyene</span> Reviews
                        </span>
                    </Link>
                </div>

                {/* Headline */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl xl:text-4xl font-bold text-[color:var(--marketing-footer-fg)] leading-tight mb-4">
                            Manage your online<br />
                            reputation with ease
                        </h2>
                        <p className="text-[color:var(--marketing-footer-muted)] text-lg leading-relaxed max-w-md">
                            Monitor reviews, respond faster with AI, and grow your business — all from one dashboard.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border border-[color:var(--marketing-footer-border)] rounded-lg bg-primary-foreground/[0.06] backdrop-blur-sm px-5 py-4 max-w-md">
                            <div className="h-10 w-10 bg-primary/15 rounded-md flex items-center justify-center shrink-0">
                                <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[color:var(--marketing-footer-fg)] font-medium text-sm">AI-Powered Replies</p>
                                <p className="text-[color:var(--marketing-footer-muted)] text-xs">Respond to reviews in one click</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border border-[color:var(--marketing-footer-border)] rounded-lg bg-primary-foreground/[0.06] backdrop-blur-sm px-5 py-4 max-w-md">
                            <div className="h-10 w-10 bg-primary/15 rounded-md flex items-center justify-center shrink-0">
                                <BarChart3 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[color:var(--marketing-footer-fg)] font-medium text-sm">Real-Time Dashboard</p>
                                <p className="text-[color:var(--marketing-footer-muted)] text-xs">Monitor all reviews in one place</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border border-[color:var(--marketing-footer-border)] rounded-lg bg-primary-foreground/[0.06] backdrop-blur-sm px-5 py-4 max-w-md">
                            <div className="h-10 w-10 bg-primary/15 rounded-md flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[color:var(--marketing-footer-fg)] font-medium text-sm">Secure Google OAuth</p>
                                <p className="text-[color:var(--marketing-footer-muted)] text-xs">Connect safely with official authorization</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-[color:var(--marketing-footer-subtle)] text-sm">
                        © {new Date().getFullYear()}{" "}
                        <a
                            href="https://zyene.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[color:var(--marketing-footer-muted)] hover:text-primary transition-colors underline-offset-2 hover:underline"
                        >
                            Zyene, Inc.
                        </a>{" "}
                        All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Content Panel */}
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center bg-background px-6 py-12 lg:px-12">
                {/* Mobile logo */}
                <div className="lg:hidden mb-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary border border-primary">
                            <Star className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">
                            <span className="text-primary">Zyene</span> Reviews
                        </span>
                    </Link>
                </div>

                <div className="w-full min-w-0 max-w-[420px]">
                    {children}
                </div>
            </div>
            <Suspense fallback={null}>
                <UtmCapture />
            </Suspense>
        </div>
    );
}
