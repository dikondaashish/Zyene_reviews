"use client";

import "@/components/marketing/support-chat/support-chat-extras.css";

import { useCallback, useEffect, useRef } from "react";

import { SupportChatComposer } from "@/components/marketing/support-chat/support-chat-composer";
import { SupportChatHeader } from "@/components/marketing/support-chat/support-chat-header";
import { SupportChatLeadForm } from "@/components/marketing/support-chat/support-chat-lead-form";
import { SupportChatMessages } from "@/components/marketing/support-chat/support-chat-messages";
import { useSupportChat } from "@/hooks/use-support-chat";
import type { SupportChatActionKey } from "@/lib/support-chat/actions";

export default function SupportChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
    const chat = useSupportChat();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    const { openWidget, requestHuman } = chat;
    const onAction = useCallback((key: SupportChatActionKey) => {
        if (key === "book_demo") openWidget("demo");
        else if (key === "check_reputation") openWidget("reputation");
        else if (key === "talk_to_human") requestHuman();
    }, [openWidget, requestHuman]);

    const leadForm = chat.leadReason && !chat.leadSubmitted ? (
        <SupportChatLeadForm
            key={chat.leadReason}
            reason={chat.leadReason}
            sessionId={chat.sessionId}
            defaultEmail={chat.email}
            pagePath={chat.pagePath}
            transcript={chat.messages.filter((m) => !m.widget && m.content)}
            onSubmitted={chat.completeLead}
            onDismiss={chat.dismissLead}
        />
    ) : null;

    return (
        <section
            id="support-chat-panel"
            className="support-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="support-chat-title"
            hidden={!open}
        >
            <SupportChatHeader onClose={onClose} onRequestHuman={chat.requestHuman} onReset={chat.reset} liveAgent={chat.liveAgent} />
            <SupportChatMessages chat={chat} onAction={onAction} footer={leadForm} />
            <SupportChatComposer
                ref={inputRef}
                email={chat.email}
                showEmail={!chat.leadSubmitted && !chat.gated}
                disabled={chat.gated}
                busy={chat.busy}
                disabledHint="Share your details above to keep chatting"
                onEmailChange={chat.setEmail}
                onSend={chat.send}
            />
        </section>
    );
}
