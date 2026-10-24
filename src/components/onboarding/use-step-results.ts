"use client";

import { useEffect, useState } from "react";
import { loadOnboardingResults, type OnboardingResults } from "@/app/actions/onboarding/results";

const POLL_MS = 4000;
/** After this long the screen says the import will finish in the background. */
const LONG_WAIT_MS = 90_000;
/** Stop asking after this; Continue still works and the import carries on in the background. */
const MAX_POLL_MS = 5 * 60_000;

/** Loads the owner's numbers, polling while the first Google import is still running. */
export function useStepResults(businessId: string) {
    const [results, setResults] = useState<OnboardingResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [waitedLong, setWaitedLong] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const startedAt = Date.now();

        const tick = async () => {
            const response = await loadOnboardingResults(businessId);
            if (cancelled) return;
            if (!response.success) {
                setError(response.error);
                return;
            }
            setResults(response.results);
            if (response.results.status === "importing") {
                const waited = Date.now() - startedAt;
                if (waited > LONG_WAIT_MS) setWaitedLong(true);
                if (waited < MAX_POLL_MS) timer = setTimeout(() => void tick(), POLL_MS);
            }
        };
        void tick();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [businessId]);

    return { results, error, waitedLong };
}
