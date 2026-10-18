"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { chatMessage, useSendQuestion, type DeferredAfterReply, type LeadReason } from "@/hooks/use-support-chat-send";
import { useSupportChatLive } from "@/hooks/use-support-chat-live";
import type { SupportChatWidget } from "@/lib/support-chat/actions";
import { emptyChatState, loadChatState, saveChatState, type StoredChatMessage, type SupportChatState } from "@/lib/support-chat/client-storage";
import { LEAD_GATE_AFTER_QUESTIONS } from "@/lib/support-chat/constants";
import type { AgentMessagePayload } from "@/lib/support-chat/realtime-channel";

export type { LeadReason } from "@/hooks/use-support-chat-send";

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? "";

export function useSupportChat() {
    const pathname = usePathname();
    // Only used by the client-only chat panel, so storage is safe to read during the first render.
    const [state, setState] = useState<SupportChatState>(loadChatState);
    /** Typing dots visible. */
    const [pending, setPending] = useState(false);
    /** A question is in flight or its answer is still typing out; blocks the next send. */
    const [busy, setBusy] = useState(false);
    /** Reply currently revealing on screen. */
    const [typingId, setTypingId] = useState<string | null>(null);
    /** Reply whose stream is still arriving. */
    const [streamingId, setStreamingId] = useState<string | null>(null);
    // A team reply in the last 30 minutes means a person is still in the conversation.
    const [liveAgent, setLiveAgent] = useState<string | null>(() =>
        state.messages.findLast((m) => m.role === "agent" && Date.now() - m.createdAt < 30 * 60_000)?.agentName ?? null);
    const deferredRef = useRef<DeferredAfterReply>({ lead: null, widget: null });
    const [leadReason, setLeadReason] = useState<LeadReason | null>(() =>
        !state.leadSubmitted && state.questionsAsked >= LEAD_GATE_AFTER_QUESTIONS ? "question_limit" : null);

    useEffect(() => {
        saveChatState(state);
    }, [state]);

    const gated = leadReason !== null && !state.leadSubmitted;
    const addMessage = useCallback((message: StoredChatMessage) => {
        setState((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    }, []);
    const patchMessage = useCallback((id: string, patch: Partial<StoredChatMessage>) => {
        setState((prev) => ({ ...prev, messages: prev.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
    }, []);

    const sendQuestion = useSendQuestion({
        state, setState, pagePath: pathname ?? undefined, setPending, setBusy, setTypingId, setStreamingId, setLiveAgent, deferredRef,
    });
    const send = useCallback((text: string) => {
        const question = text.trim();
        if (!question || busy || gated) return;
        void sendQuestion(question);
    }, [busy, gated, sendQuestion]);

    const openWidget = useCallback((widget: SupportChatWidget) => {
        addMessage(chatMessage("assistant", "", { widget }));
    }, [addMessage]);

    const finishTyping = useCallback(() => {
        setTypingId(null);
        setBusy(false);
        const { lead, widget } = deferredRef.current;
        deferredRef.current = { lead: null, widget: null };
        if (widget) openWidget(widget);
        if (lead) setLeadReason(lead);
    }, [openWidget]);

    const onAgentMessage = useCallback((payload: AgentMessagePayload) => {
        setLiveAgent(payload.agentName);
        setState((prev) => prev.messages.some((m) => m.id === payload.id) ? prev : {
            ...prev,
            messages: [...prev.messages, { id: payload.id, role: "agent", content: payload.content, agentName: payload.agentName, createdAt: Date.parse(payload.createdAt) || Date.now() }],
        });
    }, []);
    useSupportChatLive(state.sessionId, state.leadSubmitted || !!state.leadName, state.messages.at(-1)?.createdAt ?? 0, onAgentMessage);

    const requestHuman = useCallback(() => {
        if (!state.leadSubmitted) return setLeadReason("human_request");
        addMessage(chatMessage("assistant", liveAgent
            ? `${liveAgent} from the team is here. Just type your message below.`
            : "We already have your details, so the team will be in touch soon. You can also email contact@zyenereviews.com."));
    }, [addMessage, liveAgent, state.leadSubmitted]);

    const completeLead = useCallback((name: string, email: string) => {
        setLeadReason(null);
        setState((prev) => ({
            ...prev,
            email,
            leadName: firstName(name),
            leadSubmitted: true,
            messages: [...prev.messages, chatMessage("assistant", `Thanks, ${firstName(name) || "there"}! The team will reach out soon. Keep asking me anything in the meantime.`)],
        }));
    }, []);

    /** A finished card keeps its result; the summary follows as Natalie's next message. */
    const resolveWidget = useCallback((id: string, result: StoredChatMessage["widgetResult"], summary?: string, lead?: { name: string; email: string }) => {
        patchMessage(id, { widgetResult: result });
        if (lead) setState((prev) => ({ ...prev, email: lead.email, leadName: firstName(lead.name), leadSubmitted: true }));
        if (lead) setLeadReason(null);
        if (summary) addMessage(chatMessage("assistant", summary));
    }, [addMessage, patchMessage]);

    const rateReply = useCallback((message: StoredChatMessage, rating: 1 | -1) => {
        if (!message.serverId || message.feedback) return;
        patchMessage(message.id, { feedback: rating });
        void fetch("/api/marketing/chat/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: state.sessionId, messageId: message.serverId, rating }),
        }).catch(() => undefined);
    }, [patchMessage, state.sessionId]);

    const reset = useCallback(() => {
        setTypingId(null);
        setStreamingId(null);
        setBusy(false);
        deferredRef.current = { lead: null, widget: null };
        setState((prev) => ({ ...emptyChatState(), questionsAsked: prev.questionsAsked, leadSubmitted: prev.leadSubmitted, email: prev.email, leadName: prev.leadName }));
    }, []);

    return {
        ...state,
        pending, busy, typingId, streamingId, liveAgent, gated, leadReason,
        pagePath: pathname ?? undefined,
        send, finishTyping, openWidget, resolveWidget, rateReply, requestHuman, completeLead, reset,
        dismissLead: useCallback(() => setLeadReason(null), []),
        setEmail: useCallback((email: string) => setState((prev) => ({ ...prev, email })), []),
    };
}

export type SupportChatController = ReturnType<typeof useSupportChat>;
