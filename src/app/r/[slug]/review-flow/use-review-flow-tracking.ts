"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { parseReviewRefFromSearch } from "./helpers";

export function useReviewFlowTracking(
    businessId: string,
    requestId: string | undefined,
    isPreview: boolean
) {
    const [activeRequestId, setActiveRequestId] = useState<string | undefined>(requestId);
    const trackOpenInFlightRef = useRef<Promise<string | undefined> | null>(null);

    const resolveTrackingRequestId = useCallback((): string | undefined => {
        const fromProp = requestId?.trim();
        if (fromProp && z.string().uuid().safeParse(fromProp).success) {
            return fromProp;
        }
        return parseReviewRefFromSearch();
    }, [requestId]);

    const ensureActiveRequestId = useCallback(async (): Promise<string | undefined> => {
        if (isPreview) return undefined;
        if (activeRequestId) return activeRequestId;

        if (trackOpenInFlightRef.current) {
            return trackOpenInFlightRef.current;
        }

        trackOpenInFlightRef.current = (async () => {
            try {
                const rid = resolveTrackingRequestId();
                const res = await fetch("/api/track/review-open", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessId,
                        requestId: rid,
                    }),
                });

                const data = (await res.json().catch(() => ({}))) as { requestId?: string; error?: string };
                if (!res.ok) {
                }
                if (res.ok && typeof data.requestId === "string" && data.requestId.length > 0) {
                    setActiveRequestId(data.requestId);
                    return data.requestId as string;
                }
            } catch (error) {
            } finally {
                trackOpenInFlightRef.current = null;
            }

            return undefined;
        })();

        return trackOpenInFlightRef.current;
    }, [activeRequestId, businessId, isPreview, resolveTrackingRequestId]);

    useEffect(() => {
        if (isPreview) return;
        void ensureActiveRequestId();
    }, [ensureActiveRequestId, isPreview]);

    const trackRequestUpdate = useCallback(
        async (trackData: Record<string, unknown>) => {
            if (isPreview) return;
            const requestIdToUse = activeRequestId ?? (await ensureActiveRequestId());
            if (!requestIdToUse) return;
            try {
                await fetch("/api/track/review", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "update", requestId: requestIdToUse, trackData }),
                });
            } catch (error) {
            }
        },
        [activeRequestId, ensureActiveRequestId, isPreview]
    );

    return {
        activeRequestId,
        ensureActiveRequestId,
        trackRequestUpdate,
    };
}
