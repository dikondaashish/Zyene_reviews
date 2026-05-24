"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getMarketingAuthUrl } from "@/config/env";
import { appendUtmToUrl, deserializeUtm, UTM_COOKIE_NAME, type UtmParams } from "@/lib/growth/utm";

function readUtmCookie(): UtmParams | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${UTM_COOKIE_NAME}=`));
    if (!match) return null;
    return deserializeUtm(decodeURIComponent(match.split("=").slice(1).join("=")));
}

/** Signup URL with persisted UTM params for paid acquisition attribution. */
export function useMarketingSignupUrl(basePath = "/signup"): string {
    const searchParams = useSearchParams();
    return useMemo(() => {
        const fromUrl: UtmParams = {};
        ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach((key) => {
            const v = searchParams.get(key);
            if (v) (fromUrl as Record<string, string>)[key] = v;
        });
        const utm = Object.keys(fromUrl).length > 0 ? fromUrl : readUtmCookie();
        const fullBase =
            basePath === "/login" ? getMarketingAuthUrl("login") : getMarketingAuthUrl("signup");
        return appendUtmToUrl(fullBase, utm);
    }, [searchParams, basePath]);
}
