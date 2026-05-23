"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMarketingSignupUrl } from "@/lib/growth/marketing-signup-url";
import { getGoogleAdsBanner } from "@/lib/phase6/google-ads-data";
import { getMetaAdsBanner } from "@/lib/phase6/meta-ads-data";
import { deserializeUtm, UTM_COOKIE_NAME } from "@/lib/growth/utm";

function readUtmCookie(): ReturnType<typeof deserializeUtm> {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${UTM_COOKIE_NAME}=`));
    if (!match) return null;
    return deserializeUtm(decodeURIComponent(match.split("=").slice(1).join("=")));
}

export function AdLandingBanner({ className = "" }: { className?: string }) {
    const searchParams = useSearchParams();
    const signupUrl = useMarketingSignupUrl("/signup");

    const banner = useMemo(() => {
        const campaign =
            searchParams.get("utm_campaign") ??
            readUtmCookie()?.utm_campaign ??
            null;
        if (!campaign) return null;
        return getGoogleAdsBanner(campaign) ?? getMetaAdsBanner(campaign) ?? null;
    }, [searchParams]);

    if (!banner) return null;

    return (
        <div
            className={`w-full bg-primary/10 border-b border-primary/20 px-4 py-3 ${className}`}
            role="region"
            aria-label="Special offer for visitors from our ads"
        >
            <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                    <Sparkles className="text-primary shrink-0 mt-0.5 size-4" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">{banner.headline}</p>
                        <p className="text-xs text-muted-foreground">{banner.subheadline}</p>
                    </div>
                </div>
                <Link
                    href={signupUrl}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:brightness-90 shrink-0"
                >
                    Start 7-day free trial <ArrowRight className="size-3.5" />
                </Link>
            </div>
        </div>
    );
}
