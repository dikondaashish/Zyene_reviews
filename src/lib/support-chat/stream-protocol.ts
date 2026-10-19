import type { SupportChatActionKey, SupportChatWidget } from "@/lib/support-chat/actions";
import type { SupportChatIntent } from "@/lib/support-chat/constants";

/**
 * The chat endpoint streams newline-delimited JSON events:
 * any number of `delta`s, then exactly one `meta` (or `human` / `error`).
 */
export type SupportChatStreamEvent =
    | { type: "delta"; text: string }
    | {
          type: "meta";
          /** Server id of the stored reply; used for 👍/👎. Absent if storage is off. */
          messageId?: string;
          intent: SupportChatIntent;
          suggestions: string[];
          actions: SupportChatActionKey[];
          /** Card to open under the reply (demo slots, reputation check). */
          open: SupportChatWidget | null;
      }
    /** A team member owns the conversation; the question was relayed to them instead. */
    | { type: "human"; agentName: string }
    /** The guard rejected text already shown; the client swaps the whole reply for this. */
    | { type: "replace"; text: string }
    | { type: "error"; text: string };

export const STREAM_CONTENT_TYPE = "application/x-ndjson; charset=utf-8";

export function encodeStreamEvent(event: SupportChatStreamEvent): Uint8Array {
    return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

/** Parses a stream body into events; tolerant of events split across network chunks. */
export async function* readStreamEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<SupportChatStreamEvent> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
        const { value, done } = await reader.read();
        if (value) buffer += decoder.decode(value, { stream: true });
        let newline = buffer.indexOf("\n");
        while (newline !== -1) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (line) {
                try {
                    yield JSON.parse(line) as SupportChatStreamEvent;
                } catch {
                    // A malformed line is skipped rather than ending the conversation.
                }
            }
            newline = buffer.indexOf("\n");
        }
        if (done) break;
    }
}
