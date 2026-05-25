import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { ZyeneReviewsLogoLink } from "@/components/brand/zyene-reviews-logo-link";
import { Suspense } from "react";
import { UtmCapture } from "@/components/marketing/utm-capture";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

export const metadata: Metadata = {
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen min-w-0 overflow-x-clip bg-background text-foreground">
            {/* Left Branded Panel ,  espresso band uses marketing tokens so it stays on-brand in light + dark */}
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
                <div className="absolute top-1/4 -left-20 bg-primary/20 rounded-full blur-[100px] size-80" />
                <div className="absolute bottom-1/4 right-0 bg-primary/15 rounded-full blur-[80px] size-60" />

                {/* Logo */}
                <div className="relative z-10">
                    <ZyeneReviewsLogoLink
                        href={MARKETING_SITE_ORIGIN}
                        size={40}
                        priority
                        wordmarkClassName="text-[color:var(--marketing-footer-fg)]"
                    />
                </div>

                {/* Headline */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl xl:text-4xl font-bold text-[color:var(--marketing-footer-fg)] leading-tight mb-4">
                            Manage your online<br />
                            reputation with ease
                        </h2>
                        <p className="text-[color:var(--marketing-footer-muted)] text-lg leading-relaxed max-w-md">
                            Monitor reviews, respond faster with AI, and grow your business ,  all from one dashboard.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border border-[color:var(--marketing-footer-border)] rounded-lg bg-primary-foreground/[0.06] backdrop-blur-sm px-5 py-4 max-w-md">
                            <div className="bg-primary/15 rounded-md flex items-center justify-center shrink-0 size-10">
                                <Zap className="text-primary size-5" />
                            </div>
                            <div>
                                <p className="text-[color:var(--marketing-footer-fg)] font-medium text-sm">AI-Powered Replies</p>
                                <p className="text-[color:var(--marketing-footer-muted)] text-xs">Respond to reviews in one click</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border border-[color:var(--marketing-footer-border)] rounded-lg bg-primary-foreground/[0.06] backdrop-blur-sm px-5 py-4 max-w-md">
                            <div className="bg-primary/15 rounded-md flex items-center justify-center shrink-0 size-10">
                                <BarChart3 className="text-primary size-5" />
                            </div>
                            <div>
                                <p className="text-[color:var(--marketing-footer-fg)] font-medium text-sm">Real-Time Dashboard</p>
                                <p className="text-[color:var(--marketing-footer-muted)] text-xs">Monitor all reviews in one place</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border border-[color:var(--marketing-footer-border)] rounded-lg bg-primary-foreground/[0.06] backdrop-blur-sm px-5 py-4 max-w-md">
                            <div className="bg-primary/15 rounded-md flex items-center justify-center shrink-0 size-10">
                                <ShieldCheck className="text-primary size-5" />
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
                    <ZyeneReviewsLogoLink
                        href={MARKETING_SITE_ORIGIN}
                        size={40}
                        wordmarkClassName="text-foreground"
                    />
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
