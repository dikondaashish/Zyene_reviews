import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

type SetDrafts = Dispatch<SetStateAction<Record<string, string>>>;
type SetAiTyping = Dispatch<SetStateAction<Record<string, boolean>>>;

export function useNeedsAttentionAiStream(setDrafts: SetDrafts, setAiTyping: SetAiTyping) {
    const streamTimers = useRef<Record<string, ReturnType<typeof setInterval> | null>>({});

    const stopAiStream = useCallback(
        (id: string) => {
            const t = streamTimers.current[id];
            if (t != null) {
                clearInterval(t);
                streamTimers.current[id] = null;
            }
            setAiTyping((a) => ({ ...a, [id]: false }));
        },
        [setAiTyping]
    );

    const startAiStream = useCallback(
        (id: string, full: string) => {
            stopAiStream(id);
            if (!full) {
                setDrafts((d) => ({ ...d, [id]: "" }));
                return;
            }
            setDrafts((d) => ({ ...d, [id]: "" }));
            setAiTyping((a) => ({ ...a, [id]: true }));
            let i = 0;
            const charsPerTick = 2;
            const intervalMs = 14;
            streamTimers.current[id] = setInterval(() => {
                i = Math.min(i + charsPerTick, full.length);
                setDrafts((d) => ({ ...d, [id]: full.slice(0, i) }));
                if (i >= full.length) {
                    stopAiStream(id);
                }
            }, intervalMs);
        },
        [setDrafts, setAiTyping, stopAiStream]
    );

    useEffect(() => {
        const timers = streamTimers.current;
        return () => {
            for (const k of Object.keys(timers)) {
                const t = timers[k];
                if (t != null) clearInterval(t);
            }
        };
    }, []);

    return { startAiStream, stopAiStream };
}
