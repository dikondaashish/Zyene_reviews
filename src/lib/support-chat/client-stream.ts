import { readStreamEvents, type SupportChatStreamEvent } from "@/lib/support-chat/stream-protocol";

const FALLBACK_REPLY = "Sorry, I couldn't reach the team's assistant. Please try again, or email contact@zyenereviews.com.";

export interface ChatRequestBody {
    sessionId: string;
    pagePath?: string;
    messages: Array<{ role: "user" | "assistant" | "agent"; content: string }>;
}

/**
 * Posts a question and forwards each stream event. Validation errors come back as
 * plain JSON and network failures throw; both become a friendly reply plus a meta
 * event, so the caller only ever handles stream events.
 */
export async function streamChatReply(body: ChatRequestBody, onEvent: (event: SupportChatStreamEvent) => void): Promise<void> {
    const fallback = (text: string) => {
        onEvent({ type: "delta", text });
        onEvent({ type: "meta", intent: "answer", suggestions: [], actions: [], open: null });
    };
    try {
        const res = await fetch("/api/marketing/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const isStream = res.headers.get("content-type")?.includes("ndjson");
        if (!isStream || !res.body) {
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            fallback(data.error ?? FALLBACK_REPLY);
            return;
        }
        let ended = false;
        for await (const event of readStreamEvents(res.body)) {
            if (event.type === "meta" || event.type === "human") ended = true;
            if (event.type === "error") {
                fallback(event.text);
                return;
            }
            onEvent(event);
        }
        // Connection dropped before the reply finished: close it out cleanly.
        if (!ended) onEvent({ type: "meta", intent: "answer", suggestions: [], actions: [], open: null });
    } catch {
        fallback(FALLBACK_REPLY);
    }
}
