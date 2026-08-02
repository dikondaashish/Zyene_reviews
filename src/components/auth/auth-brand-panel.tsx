import { BarChart3, ShieldCheck, Zap } from "lucide-react";
import { ZyeneReviewsLogoLink } from "@/components/brand/zyene-reviews-logo-link";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

const FEATURES = [
    { icon: Zap, title: "AI-Powered Replies", detail: "Respond to reviews in one click" },
    { icon: BarChart3, title: "Real-Time Dashboard", detail: "Monitor all reviews in one place" },
    { icon: ShieldCheck, title: "Secure Google OAuth", detail: "Connect safely with official authorization" },
] as const;

export function AuthBrandPanel() {
    return (
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[color:var(--marketing-footer-bg)] flex-col justify-between p-12 text-[color:var(--marketing-footer-fg)]">
            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, var(--marketing-footer-fg) 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                }}
            />
            <div className="absolute top-1/4 -left-20 bg-primary/20 rounded-full blur-[100px] size-80" />
            <div className="absolute bottom-1/4 right-0 bg-primary/15 rounded-full blur-[80px] size-60" />

            <div className="relative z-10">
                <ZyeneReviewsLogoLink
                    href={MARKETING_SITE_ORIGIN}
                    size={40}
                    priority
                    wordmarkClassName="text-[color:var(--marketing-footer-fg)]"
                />
            </div>

            <div className="relative z-10 space-y-8">
                <div>
                    <h2 className="text-3xl xl:text-4xl font-bold text-[color:var(--marketing-footer-fg)] leading-tight mb-4">
                        Manage your online<br />
                        reputation with ease
                    </h2>
                    <p className="text-[color:var(--marketing-footer-muted)] text-lg leading-relaxed max-w-md">
                        Monitor reviews, respond faster with AI, and grow your business—all from one dashboard.
                    </p>
                </div>

                <div className="space-y-4">
                    {FEATURES.map(({ icon: Icon, title, detail }) => (
                        <div
                            key={title}
                            className="flex items-center gap-4 border border-[color:var(--marketing-footer-border)] rounded-lg bg-primary-foreground/[0.06] backdrop-blur-sm px-5 py-4 max-w-md"
                        >
                            <div className="bg-primary/15 rounded-md flex items-center justify-center shrink-0 size-10">
                                <Icon className="text-primary size-5" aria-hidden />
                            </div>
                            <div>
                                <p className="text-[color:var(--marketing-footer-fg)] font-medium text-sm">{title}</p>
                                <p className="text-[color:var(--marketing-footer-muted)] text-xs">{detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="relative z-10 text-[color:var(--marketing-footer-subtle)] text-sm">
                © {new Date().getFullYear()} {" "}
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
    );
}
