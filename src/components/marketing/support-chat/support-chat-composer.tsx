"use client";

import { ArrowUp } from "lucide-react";
import { forwardRef, useState, type KeyboardEvent } from "react";

import { SupportChatEmojiPicker } from "@/components/marketing/support-chat/support-chat-emoji-picker";
import { MAX_USER_MESSAGE_CHARS } from "@/lib/support-chat/constants";

interface ComposerProps {
    email: string;
    showEmail: boolean;
    disabled: boolean;
    disabledHint?: string;
    onEmailChange: (email: string) => void;
    onSend: (text: string) => void;
}

export const SupportChatComposer = forwardRef<HTMLTextAreaElement, ComposerProps>(function SupportChatComposer(
    { email, showEmail, disabled, disabledHint, onEmailChange, onSend },
    textareaRef,
) {
    const [draft, setDraft] = useState("");
    const canSend = !disabled && draft.trim().length > 0;

    const submit = () => {
        if (!canSend) return;
        onSend(draft);
        setDraft("");
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submit();
        }
    };

    return (
        <form
            className={`support-chat-composer${disabled ? " support-chat-composer--disabled" : ""}`}
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
        >
            {showEmail ? (
                <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="support-chat-composer__email"
                    placeholder="email@example.com"
                    aria-label="Your email (optional)"
                    value={email}
                    maxLength={320}
                    onChange={(event) => onEmailChange(event.target.value)}
                />
            ) : null}
            <textarea
                ref={textareaRef}
                className="support-chat-composer__input"
                placeholder={disabled && disabledHint ? disabledHint : "Ask a question..."}
                aria-label="Ask a question"
                rows={1}
                maxLength={MAX_USER_MESSAGE_CHARS}
                value={draft}
                disabled={disabled}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
            />
            <div className="support-chat-composer__actions">
                {draft.length > MAX_USER_MESSAGE_CHARS - 80 ? (
                    <span className="support-chat-composer__count">{MAX_USER_MESSAGE_CHARS - draft.length}</span>
                ) : null}
                <SupportChatEmojiPicker disabled={disabled} onPick={(emoji) => setDraft((value) => `${value}${emoji}`.slice(0, MAX_USER_MESSAGE_CHARS))} />
                <button type="submit" className="support-chat-send" aria-label="Send message" disabled={!canSend}>
                    <ArrowUp size={16} strokeWidth={2.25} aria-hidden="true" />
                </button>
            </div>
        </form>
    );
});
