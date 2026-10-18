"use client";

import Image from "next/image";
import { ChevronDown, X } from "lucide-react";

import { SUPPORT_AGENT_AVATAR, SUPPORT_AGENT_NAME, SUPPORT_CHAT_TEASER } from "@/lib/support-chat/constants";

function ChatGlyph() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M4 3h16v13h-9l-4.5 4.5V16H4z" fill="currentColor" />
            <path d="M12.5 16 17 20.5V16z" fill="currentColor" opacity="0.55" />
        </svg>
    );
}

export function SupportChatTeaser({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
    return (
        <div className="support-chat-teaser" role="status">
            <button type="button" className="support-chat-teaser__body" onClick={onOpen}>
                <span className="support-chat-teaser__avatar">
                    <Image src={SUPPORT_AGENT_AVATAR} alt={`${SUPPORT_AGENT_NAME} avatar`} width={36} height={36} />
                </span>
                <span className="support-chat-teaser__text">{SUPPORT_CHAT_TEASER}</span>
            </button>
            <button type="button" className="support-chat-teaser__close" aria-label="Dismiss chat message" onClick={onDismiss}>
                <X size={14} aria-hidden="true" />
            </button>
        </div>
    );
}

export function SupportChatLauncher({ open, onToggle }: { open: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            className={`support-chat-launcher${open ? " support-chat-launcher--open" : ""}`}
            aria-expanded={open}
            aria-controls="support-chat-panel"
            aria-label={open ? "Close chat" : "Chat with us"}
            onClick={onToggle}
        >
            {open ? (
                <ChevronDown size={22} strokeWidth={2.25} aria-hidden="true" />
            ) : (
                <>
                    <ChatGlyph />
                    <span>Text us</span>
                </>
            )}
        </button>
    );
}
