import type { Metadata } from "next";
import { ZyeneReviewsLogoLink } from "@/components/brand/zyene-reviews-logo-link";
import { Suspense } from "react";
import { UtmCapture } from "@/components/marketing/utm-capture";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

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
            <AuthBrandPanel />

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
