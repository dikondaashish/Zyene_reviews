"use client";

import { useEffect, useRef } from "react";

import { SupportChatComposer } from "@/components/marketing/support-chat/support-chat-composer";
import { SupportChatHeader } from "@/components/marketing/support-chat/support-chat-header";
import { SupportChatLeadForm } from "@/components/marketing/support-chat/support-chat-lead-form";
import { SupportChatMessages } from "@/components/marketing/support-chat/support-chat-messages";
import { useSupportChat } from "@/hooks/use-support-chat";

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

    const leadForm = chat.leadReason && !chat.leadSubmitted ? (
        <SupportChatLeadForm
            key={chat.leadReason}
            reason={chat.leadReason}
            sessionId={chat.sessionId}
            defaultEmail={chat.email}
            pagePath={chat.pagePath}
            transcript={chat.messages}
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
            <SupportChatHeader onClose={onClose} onRequestHuman={chat.requestHuman} onReset={chat.reset} />
            <SupportChatMessages messages={chat.messages} pending={chat.pending} onStarter={chat.send} footer={leadForm} />
            <SupportChatComposer
                ref={inputRef}
                email={chat.email}
                showEmail={!chat.leadSubmitted && !chat.gated}
                disabled={chat.gated}
                disabledHint="Share your details above to keep chatting"
                onEmailChange={chat.setEmail}
                onSend={chat.send}
            />
        </section>
    );
}
