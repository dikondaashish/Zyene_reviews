"use client";

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";

import type { SupportChatWidget } from "@/lib/support-chat/actions";
import type { StoredChatMessage, SupportChatState } from "@/lib/support-chat/client-storage";
import { streamChatReply } from "@/lib/support-chat/client-stream";
import { LEAD_GATE_AFTER_QUESTIONS } from "@/lib/support-chat/constants";
import type { SupportChatStreamEvent } from "@/lib/support-chat/stream-protocol";

export type LeadReason = "question_limit" | "human_request";

/** Things that wait until the reply has finished typing out. */
export interface DeferredAfterReply {
    lead: LeadReason | null;
    widget: SupportChatWidget | null;
}

/** A person notices the message before they start typing... */
const TYPING_DOTS_DELAY_MS = 600;
/** ...and never answers instantly, even when the model does. */
const MIN_REPLY_DELAY_MS = 1_200;

export function chatMessage(role: StoredChatMessage["role"], content: string, extra: Partial<StoredChatMessage> = {}): StoredChatMessage {
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, content, createdAt: Date.now(), ...extra };
}

interface SendDeps {
    state: SupportChatState;
    setState: Dispatch<SetStateAction<SupportChatState>>;
    pagePath?: string;
    setPending: (value: boolean) => void;
    setBusy: (value: boolean) => void;
    setTypingId: (id: string | null) => void;
    setStreamingId: (id: string | null) => void;
    setLiveAgent: (name: string | null) => void;
    deferredRef: MutableRefObject<DeferredAfterReply>;
}

/** Sends a question and plays the streamed reply into the thread as it arrives. */
export function useSendQuestion(deps: SendDeps) {
    const { state, setState, pagePath, setPending, setBusy, setTypingId, setStreamingId, setLiveAgent, deferredRef } = deps;

    return useCallback(async (question: string) => {
        const userMessage = chatMessage("user", question);
        const thread = [...state.messages.filter((m) => !m.widget), userMessage];
        const asked = state.questionsAsked + 1;
        setState((prev) => ({ ...prev, messages: [...prev.messages, userMessage], questionsAsked: asked }));
        setBusy(true);
        const dotsTimer = window.setTimeout(() => setPending(true), TYPING_DOTS_DELAY_MS);

        let replyId: string | null = null;
        let text = "";
        let released = false;
        let meta: Extract<SupportChatStreamEvent, { type: "meta" }> | null = null;
        let humanName: string | null = null;

        const patchReply = (patch: Partial<StoredChatMessage>) => {
            const id = replyId;
            setState((prev) => ({ ...prev, messages: prev.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
        };
        // Text is held until the human-feeling minimum delay has passed, then flows live.
        const flush = () => {
            if (!released || !text) return;
            if (replyId) return patchReply({ content: text });
            const reply = chatMessage("assistant", text);
            replyId = reply.id;
            window.clearTimeout(dotsTimer);
            setPending(false);
            setTypingId(reply.id);
            setStreamingId(reply.id);
            setState((prev) => ({ ...prev, messages: [...prev.messages, reply] }));
        };
        const minDelay = new Promise<void>((resolve) => window.setTimeout(resolve, MIN_REPLY_DELAY_MS)).then(() => {
            released = true;
            flush();
        });

        await streamChatReply(
            { sessionId: state.sessionId, pagePath, messages: thread.map(({ role, content }) => ({ role, content })) },
            (event) => {
                if (event.type === "delta") text += event.text;
                else if (event.type === "replace") text = event.text;
                else if (event.type === "meta") meta = event;
                else if (event.type === "human") humanName = event.agentName;
                flush();
            },
        );
        await minDelay;
        window.clearTimeout(dotsTimer);
        setPending(false);

        if (humanName) {
            setLiveAgent(humanName);
            setState((prev) => ({ ...prev, messages: [...prev.messages, chatMessage("assistant", `Sent to ${humanName}. They'll reply right here.`)] }));
            setBusy(false);
            return;
        }

        // Every question gets a bubble, so the typing-finished callback always fires.
        text = text.trim() || "Sorry, I couldn't answer that just now. Please try again in a moment.";
        flush();
        const finalMeta = meta as Extract<SupportChatStreamEvent, { type: "meta" }> | null;
        deferredRef.current = {
            widget: finalMeta?.open ?? null,
            lead: state.leadSubmitted || finalMeta?.open
                ? null
                : finalMeta?.intent === "handoff" ? "human_request" : asked >= LEAD_GATE_AFTER_QUESTIONS ? "question_limit" : null,
        };
        patchReply({
            content: text,
            serverId: finalMeta?.messageId,
            suggestions: finalMeta?.suggestions ?? [],
            actions: finalMeta?.actions ?? [],
        });
        setStreamingId(null);
    }, [deferredRef, pagePath, setBusy, setLiveAgent, setPending, setState, setStreamingId, setTypingId, state]);
}
