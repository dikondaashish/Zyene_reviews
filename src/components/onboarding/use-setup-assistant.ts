"use client";

import { useRef, useState } from "react";
import { streamChatReply } from "@/lib/support-chat/client-stream";
import { MAX_USER_MESSAGE_CHARS } from "@/lib/support-chat/constants";

export type SetupChatMessage = { id: number; role: "user" | "assistant" | "agent"; content: string; pending?: boolean };

const ENDPOINT = "/api/onboarding/assistant";

function newSessionId(): string {
    return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^A-Za-z0-9]/g, "").slice(0, 40);
}

/** One conversation with Zyene AI for this visit to setup, streamed word by word. */
export function useSetupAssistant(step: number) {
    const [messages, setMessages] = useState<SetupChatMessage[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const sessionId = useRef<string>("");
    const nextId = useRef(1);

    const patchLast = (update: (m: SetupChatMessage) => SetupChatMessage) =>
        setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? update(m) : m)));

    const ask = async (raw: string) => {
        const question = raw.trim().slice(0, MAX_USER_MESSAGE_CHARS);
        if (!question || busy) return;
        if (!sessionId.current) sessionId.current = newSessionId();
        const history = messages.filter((m) => m.content.trim()).map(({ role, content }) => ({ role, content }));
        // Ids are taken before the state update: React may run an updater twice.
        const id = nextId.current;
        nextId.current += 2;
        setMessages((prev) => [
            ...prev,
            { id, role: "user", content: question },
            { id: id + 1, role: "assistant", content: "", pending: true },
        ]);
        setSuggestions([]);
        setBusy(true);
        await streamChatReply(
            { sessionId: sessionId.current, pagePath: "/onboarding", step, messages: [...history, { role: "user", content: question }] },
            (event) => {
                if (event.type === "delta") patchLast((m) => ({ ...m, content: m.content + event.text }));
                else if (event.type === "replace") patchLast((m) => ({ ...m, content: event.text }));
                else if (event.type === "human") patchLast((m) => ({ ...m, role: "agent", pending: false, content: `${event.agentName} from our team is here and will reply shortly.` }));
                else if (event.type === "meta") {
                    patchLast((m) => ({ ...m, pending: false }));
                    setSuggestions(event.suggestions.slice(0, 3));
                }
            },
            ENDPOINT,
        );
        patchLast((m) => ({ ...m, pending: false }));
        setBusy(false);
    };

    return { messages, suggestions, busy, ask };
}
