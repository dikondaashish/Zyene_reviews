"use client";

import { useCallback, useEffect, useState } from "react";
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

const FALLBACK_REPLY = "Sorry, I couldn't reach the team's assistant. Please try again, or email contact@zyenereviews.com.";

function message(role: StoredChatMessage["role"], content: string): StoredChatMessage {
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, content, createdAt: Date.now() };
}

export function useSupportChat() {
    const pathname = usePathname();
    // Only used by the client-only chat panel, so storage is safe to read during the first render.
    const [state, setState] = useState<SupportChatState>(loadChatState);
    const [pending, setPending] = useState(false);
    const [leadReason, setLeadReason] = useState<LeadReason | null>(() =>
        !state.leadSubmitted && state.questionsAsked >= LEAD_GATE_AFTER_QUESTIONS ? "question_limit" : null);

    useEffect(() => {
        saveChatState(state);
    }, [state]);

    const gated = leadReason !== null && !state.leadSubmitted;

    const send = useCallback(async (text: string) => {
        const question = text.trim();
        if (!question || pending || gated) return;
        const userMessage = message("user", question);
        const thread = [...state.messages, userMessage];
        const asked = state.questionsAsked + 1;
        setState((prev) => ({ ...prev, messages: thread, questionsAsked: asked }));
        setPending(true);

        let reply = FALLBACK_REPLY;
        let intent: SupportChatIntent = "answer";
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

        setState((prev) => ({ ...prev, messages: [...prev.messages, message("assistant", reply)] }));
        setPending(false);
        if (state.leadSubmitted) return;
        if (intent === "handoff") setLeadReason("human_request");
        else if (asked >= LEAD_GATE_AFTER_QUESTIONS) setLeadReason("question_limit");
    }, [gated, pathname, pending, state]);

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
        setState((prev) => ({ ...emptyChatState(), questionsAsked: prev.questionsAsked, leadSubmitted: prev.leadSubmitted, email: prev.email }));
    }, []);

    const setEmail = useCallback((email: string) => setState((prev) => ({ ...prev, email })), []);

    return {
        messages: state.messages,
        sessionId: state.sessionId,
        email: state.email,
        leadSubmitted: state.leadSubmitted,
        pending,
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
