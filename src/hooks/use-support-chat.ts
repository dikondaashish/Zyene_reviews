"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { LEAD_GATE_AFTER_QUESTIONS, type SupportChatIntent } from "@/lib/support-chat/constants";
import {
    emptyChatState,
    loadChatState,
    saveChatState,
    type StoredChatMessage,
    type SupportChatState,
} from "@/lib/support-chat/client-storage";

export type LeadReason = "question_limit" | "human_request";

/** A person notices the message before they start typing... */
const TYPING_DOTS_DELAY_MS = 600;
/** ...and never answers instantly, even when the model does. */
const MIN_REPLY_DELAY_MS = 1_400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const FALLBACK_REPLY = "Sorry, I couldn't reach the team's assistant. Please try again, or email contact@zyenereviews.com.";

function message(role: StoredChatMessage["role"], content: string): StoredChatMessage {
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, content, createdAt: Date.now() };
}

export function useSupportChat() {
    const pathname = usePathname();
    // Only used by the client-only chat panel, so storage is safe to read during the first render.
    const [state, setState] = useState<SupportChatState>(loadChatState);
    /** Typing dots visible. */
    const [pending, setPending] = useState(false);
    /** A question is in flight or its answer is still typing out; blocks the next send. */
    const [busy, setBusy] = useState(false);
    const [typingId, setTypingId] = useState<string | null>(null);
    const deferredLead = useRef<LeadReason | null>(null);
    const [leadReason, setLeadReason] = useState<LeadReason | null>(() =>
        !state.leadSubmitted && state.questionsAsked >= LEAD_GATE_AFTER_QUESTIONS ? "question_limit" : null);

    useEffect(() => {
        saveChatState(state);
    }, [state]);

    const gated = leadReason !== null && !state.leadSubmitted;

    const send = useCallback(async (text: string) => {
        const question = text.trim();
        if (!question || busy || gated) return;
        const userMessage = message("user", question);
        const thread = [...state.messages, userMessage];
        const asked = state.questionsAsked + 1;
        setState((prev) => ({ ...prev, messages: thread, questionsAsked: asked }));
        setBusy(true);
        const dotsTimer = window.setTimeout(() => setPending(true), TYPING_DOTS_DELAY_MS);

        let reply = FALLBACK_REPLY;
        let intent: SupportChatIntent = "answer";
        const minDelay = wait(MIN_REPLY_DELAY_MS);
        try {
            const res = await fetch("/api/marketing/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: state.sessionId,
                    pagePath: pathname ?? undefined,
                    messages: thread.map(({ role, content }) => ({ role, content })),
                }),
            });
            const data = (await res.json()) as { reply?: string; intent?: SupportChatIntent; error?: string };
            reply = data.reply ?? data.error ?? FALLBACK_REPLY;
            intent = data.intent ?? "answer";
        } catch {
            // Network failure: the fallback reply explains what to do next.
        }

        await minDelay;
        window.clearTimeout(dotsTimer);

        // The contact form waits until this answer has finished typing out.
        deferredLead.current = state.leadSubmitted
            ? null
            : intent === "handoff" ? "human_request" : asked >= LEAD_GATE_AFTER_QUESTIONS ? "question_limit" : null;
        const answer = message("assistant", reply);
        setPending(false);
        setTypingId(answer.id);
        setState((prev) => ({ ...prev, messages: [...prev.messages, answer] }));
    }, [busy, gated, pathname, state]);

    const finishTyping = useCallback(() => {
        setTypingId(null);
        setBusy(false);
        if (deferredLead.current) setLeadReason(deferredLead.current);
        deferredLead.current = null;
    }, []);

    const requestHuman = useCallback(() => {
        if (state.leadSubmitted) {
            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, message("assistant", "We already have your details, so the team will be in touch soon. You can also email contact@zyenereviews.com.")],
            }));
            return;
        }
        setLeadReason("human_request");
    }, [state.leadSubmitted]);

    const completeLead = useCallback((name: string, email: string) => {
        const first = name.trim().split(/\s+/)[0] || "there";
        setLeadReason(null);
        setState((prev) => ({
            ...prev,
            email,
            leadSubmitted: true,
            messages: [...prev.messages, message("assistant", `Thanks, ${first}! The team will reach out soon. Keep asking me anything in the meantime.`)],
        }));
    }, []);

    const dismissLead = useCallback(() => setLeadReason(null), []);

    const reset = useCallback(() => {
        setTypingId(null);
        setBusy(false);
        deferredLead.current = null;
        setState((prev) => ({ ...emptyChatState(), questionsAsked: prev.questionsAsked, leadSubmitted: prev.leadSubmitted, email: prev.email }));
    }, []);

    const setEmail = useCallback((email: string) => setState((prev) => ({ ...prev, email })), []);

    return {
        messages: state.messages,
        sessionId: state.sessionId,
        email: state.email,
        leadSubmitted: state.leadSubmitted,
        pending,
        busy,
        typingId,
        finishTyping,
        gated,
        leadReason,
        pagePath: pathname ?? undefined,
        send,
        setEmail,
        requestHuman,
        completeLead,
        dismissLead,
        reset,
    };
}

export type SupportChatController = ReturnType<typeof useSupportChat>;
