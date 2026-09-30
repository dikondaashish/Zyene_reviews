"use client";

import { useEffect, useRef, useState } from "react";
import { navigateToGoogleBusinessOAuthOnboarding } from "@/components/onboarding/step2-form-google-oauth-navigate";

export function useGoogleOAuthNavigation(businessId: string) {
    const inFlight = useRef(false);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        const onPageShow = (event: PageTransitionEvent) => {
            // Safari can restore this document, including its disabled button, on Back.
            if (event.persisted) {
                inFlight.current = false;
                setPending(false);
            }
        };
        window.addEventListener("pageshow", onPageShow);
        return () => window.removeEventListener("pageshow", onPageShow);
    }, []);

    return {
        pending,
        connect: () => navigateToGoogleBusinessOAuthOnboarding(businessId, inFlight, setPending),
    };
}
