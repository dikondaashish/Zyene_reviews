"use client";

import { Suspense } from "react";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { UtmCapture } from "@/components/marketing/utm-capture";
import { AdLandingBanner } from "@/components/marketing/ad-landing-banner";
import { MarketingLayoutHeader } from "./marketing-layout-header";
import { MarketingLayoutFooter } from "./marketing-layout-footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-foreground">
            <MarketingLayoutHeader />
            <Suspense fallback={null}>
                <UtmCapture />
            </Suspense>
            <Suspense fallback={null}>
                <AdLandingBanner />
            </Suspense>
            <main className="min-w-0 flex-1">{children}</main>
            <CookieBanner />
            <MarketingLayoutFooter />
        </div>
    );
}
