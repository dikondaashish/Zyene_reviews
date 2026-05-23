"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useReviewCardAiStream(setReplyText: (value: string) => void) {
    const [isAiTyping, setIsAiTyping] = useState(false);
    const aiStreamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopAiStream = useCallback(() => {
        if (aiStreamIntervalRef.current !== null) {
            clearInterval(aiStreamIntervalRef.current);
            aiStreamIntervalRef.current = null;
        }
        setIsAiTyping(false);
    }, []);

    const startAiStream = useCallback(
        (full: string) => {
            stopAiStream();
            if (!full) {
                setReplyText("");
                return;
            }
            setReplyText("");
            setIsAiTyping(true);
            let i = 0;
            const charsPerTick = 2;
            const intervalMs = 14;
            aiStreamIntervalRef.current = setInterval(() => {
                i = Math.min(i + charsPerTick, full.length);
                setReplyText(full.slice(0, i));
                if (i >= full.length) {
                    if (aiStreamIntervalRef.current !== null) {
                        clearInterval(aiStreamIntervalRef.current);
                        aiStreamIntervalRef.current = null;
                    }
                    setIsAiTyping(false);
                }
            }, intervalMs);
        },
        [stopAiStream, setReplyText]
    );

    useEffect(() => () => stopAiStream(), [stopAiStream]);

    return { isAiTyping, stopAiStream, startAiStream };
}
