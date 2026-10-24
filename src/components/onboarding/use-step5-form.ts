"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { completeOnboarding } from "@/app/actions/onboarding";

/** Where setup ends: the real dashboard, where a one-time welcome and short tour take over. */
export const WELCOME_URL = "/dashboard?welcome=1";

const FAILED = "Could not finish setup. Please try again.";

export function useStep5Form(businessId: string) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const started = useRef(false);

    const finish = useCallback(() => {
        completeOnboarding(businessId)
            .then((result) => {
                if (result.success) router.replace(WELCOME_URL);
                else setError(result.error || FAILED);
            })
            .catch(() => setError(FAILED));
    }, [businessId, router]);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        finish();
    }, [finish]);

    const retry = () => {
        setError(null);
        finish();
    };

    return { error, retry };
}
