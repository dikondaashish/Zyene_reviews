"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    UTM_COOKIE_NAME,
    UTM_COOKIE_MAX_AGE_DAYS,
    parseUtmFromSearchParams,
    serializeUtm,
    hasUtmParams,
} from "@/lib/growth/utm";
import { usePrivacy } from "@/lib/privacy/privacy-store";

/** Persists UTM params from landing URLs into a cookie for signup attribution. */
export function UtmCapture() {
    const searchParams = useSearchParams();
    const marketingConsent = usePrivacy().granted.marketing;

    useEffect(() => {
        const params = parseUtmFromSearchParams(searchParams);
        // Campaign attribution is a marketing cookie: only stored after consent.
        if (!hasUtmParams(params) || !marketingConsent) return;

        const maxAge = UTM_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
        document.cookie = `${UTM_COOKIE_NAME}=${encodeURIComponent(serializeUtm(params))};path=/;max-age=${maxAge};SameSite=Lax`;
    }, [searchParams, marketingConsent]);

    return null;
}
