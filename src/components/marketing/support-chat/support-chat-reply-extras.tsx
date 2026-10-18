"use client";

import Link from "next/link";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { SUPPORT_CHAT_ACTIONS, type SupportChatActionKey } from "@/lib/support-chat/actions";
import type { StoredChatMessage } from "@/lib/support-chat/client-storage";

interface ReplyExtrasProps {
    message: StoredChatMessage;
    /** Buttons and follow-ups only show under the latest reply. */
    latest: boolean;
    onAction: (key: SupportChatActionKey) => void;
    onSuggestion: (text: string) => void;
    onRate: (message: StoredChatMessage, rating: 1 | -1) => void;
}

export function SupportChatReplyExtras({ message, latest, onAction, onSuggestion, onRate }: ReplyExtrasProps) {
    const actions = latest ? message.actions ?? [] : [];
    const suggestions = latest ? message.suggestions ?? [] : [];
    const canRate = !!message.serverId;
    if (!actions.length && !suggestions.length && !canRate) return null;

    return (
        <div className="support-chat-extras">
            {actions.length ? (
                <div className="support-chat-actions">
                    {actions.map((key) => {
                        const action = SUPPORT_CHAT_ACTIONS[key];
                        return action.kind === "link" ? (
                            <Link key={key} href={action.href} className="support-chat-action">{action.label}</Link>
                        ) : (
                            <button key={key} type="button" className="support-chat-action" onClick={() => onAction(key)}>{action.label}</button>
                        );
                    })}
                </div>
            ) : null}
            {canRate ? (
                <div className="support-chat-feedback" role="group" aria-label="Was this helpful?">
                    <button
                        type="button"
                        aria-label="Helpful"
                        aria-pressed={message.feedback === 1}
                        disabled={!!message.feedback}
                        onClick={() => onRate(message, 1)}
                    >
                        <ThumbsUp size={13} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        aria-label="Not helpful"
                        aria-pressed={message.feedback === -1}
                        disabled={!!message.feedback}
                        onClick={() => onRate(message, -1)}
                    >
                        <ThumbsDown size={13} aria-hidden="true" />
                    </button>
                    {message.feedback ? <span>Thanks for the feedback</span> : null}
                </div>
            ) : null}
            {suggestions.length ? (
                <div className="support-chat-starters support-chat-followups" aria-label="Suggested follow-up questions">
                    {suggestions.map((s) => <button key={s} type="button" onClick={() => onSuggestion(s)}>{s}</button>)}
                </div>
            ) : null}
        </div>
    );
}
