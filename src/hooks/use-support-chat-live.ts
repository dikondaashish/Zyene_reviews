"use client";

import { useEffect, useRef } from "react";

import { supportChatChannelName, type AgentMessagePayload } from "@/lib/support-chat/realtime-channel";

/**
 * Live replies from a team member (sent from Slack). Listens on the conversation's
 * Realtime broadcast channel, and catches up from history on open and whenever the
 * tab becomes visible again, so a reply sent while offline is never lost.
 */
export function useSupportChatLive(
    sessionId: string,
    enabled: boolean,
    lastMessageAt: number,
    onAgentMessage: (message: AgentMessagePayload) => void,
) {
    const handler = useRef(onAgentMessage);
    const since = useRef(lastMessageAt);

    useEffect(() => {
        handler.current = onAgentMessage;
        since.current = lastMessageAt;
    }, [onAgentMessage, lastMessageAt]);

    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        let cleanup: (() => void) | undefined;

        const catchUp = async () => {
            const after = new Date(since.current || Date.now() - 86_400_000).toISOString();
            try {
                const res = await fetch(`/api/marketing/chat/agent-messages?sessionId=${encodeURIComponent(sessionId)}&since=${encodeURIComponent(after)}`);
                if (!res.ok) return;
                const data = (await res.json()) as { messages?: AgentMessagePayload[] };
                if (!cancelled) data.messages?.forEach((m) => handler.current(m));
            } catch {
                // Realtime still delivers new replies; history catch-up is best-effort.
            }
        };

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && anonKey) {
            void import("@supabase/supabase-js").then(({ createClient }) => {
                if (cancelled) return;
                const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
                const channel = client
                    .channel(supportChatChannelName(sessionId))
                    .on("broadcast", { event: "agent_message" }, ({ payload }) => handler.current(payload as AgentMessagePayload))
                    .subscribe();
                cleanup = () => void client.removeChannel(channel);
            });
        }

        const onVisible = () => {
            if (document.visibilityState === "visible") void catchUp();
        };
        void catchUp();
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            cancelled = true;
            document.removeEventListener("visibilitychange", onVisible);
            cleanup?.();
        };
    }, [enabled, sessionId]);
}
