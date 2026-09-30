"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { parseReviewRefFromSearch } from "./helpers";

export function useReviewFlowTracking(
    businessId: string,
    requestId: string | undefined,
    openToken: string | undefined,
    isPreview: boolean
) {
    const [activeRequestId, setActiveRequestId] = useState<string | undefined>(requestId);
    const trackingTokenRef = useRef<string | undefined>(undefined);
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
        if (activeRequestId && trackingTokenRef.current) return activeRequestId;

        if (trackOpenInFlightRef.current) {
            return trackOpenInFlightRef.current;
        }

        trackOpenInFlightRef.current = (async () => {
            try {
                const rid = resolveTrackingRequestId();
                let res = await fetch("/api/track/review-open", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        businessId,
                        requestId: rid,
                        token: new URLSearchParams(window.location.search).get("sig") || undefined,
                        openToken,
                    }),
                });

                if (!res.ok && rid && openToken) {
                    res = await fetch("/api/track/review-open", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ businessId, openToken }),
                    });
                }

                if (!res.ok) return undefined;

                const data = (await res.json().catch(() => ({}))) as {
                    requestId?: string; token?: string; error?: string;
                };
                if (typeof data.requestId === "string" && typeof data.token === "string") {
                    trackingTokenRef.current = data.token;
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
    }, [activeRequestId, businessId, isPreview, openToken, resolveTrackingRequestId]);

    useEffect(() => {
        if (isPreview) return;
        void ensureActiveRequestId();
    }, [ensureActiveRequestId, isPreview]);

    const trackRequestUpdate = useCallback(
        async (trackData: Record<string, unknown>) => {
            if (isPreview) return;
            const requestIdToUse = await ensureActiveRequestId();
            if (!requestIdToUse || !trackingTokenRef.current) return;
            try {
                await fetch("/api/track/review", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "update", requestId: requestIdToUse, businessId,
                        token: trackingTokenRef.current, trackData,
                    }),
                });
            } catch (error) {
            }
        },
        [businessId, ensureActiveRequestId, isPreview]
    );

    return {
        activeRequestId,
        ensureActiveRequestId,
        getTrackingToken: () => trackingTokenRef.current,
        trackRequestUpdate,
    };
}
