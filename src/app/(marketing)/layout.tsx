"use client";

import "@/app/(marketing)/marketing.css";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { UtmCapture } from "@/components/marketing/utm-capture";
import { AdLandingBanner } from "@/components/marketing/ad-landing-banner";
import { MarketingLayoutHeader } from "@/app/(marketing)/marketing-layout-header";
import { MarketingLayoutFooter } from "@/app/(marketing)/marketing-layout-footer";

function isGrowthOperationsPath(pathname: string | null): boolean {
    return pathname === "/growth" || (pathname?.startsWith("/growth/") ?? false);
}

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const growthDashboard = isGrowthOperationsPath(pathname);

    return (
        <div className={`${growthDashboard ? "" : "marketing-site"} flex min-h-dvh min-w-0 flex-col bg-background text-foreground`}>
            <a href="#main-content" className="marketing-skip-link marketing-button sr-only focus:not-sr-only">Skip to content</a>
            <MarketingLayoutHeader />
            <Suspense fallback={null}>
                <UtmCapture />
            </Suspense>
            {growthDashboard ? null : (
                <Suspense fallback={null}>
                    <AdLandingBanner />
                </Suspense>
            )}
            <main id="main-content" tabIndex={-1} className="marketing-content min-w-0 flex-1">{children}</main>
            {growthDashboard ? null : <MarketingLayoutFooter />}
        </div>
    );
}
