"use client";

import Image from "next/image";
import { MoreHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SUPPORT_AGENT_AVATAR, SUPPORT_AGENT_NAME } from "@/lib/support-chat/constants";

interface HeaderProps {
    onClose: () => void;
    onRequestHuman: () => void;
    onReset: () => void;
}

export function SupportChatHeader({ onClose, onRequestHuman, onReset }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const onPointer = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("pointerdown", onPointer);
        return () => document.removeEventListener("pointerdown", onPointer);
    }, [menuOpen]);

    const choose = (action: () => void) => () => {
        setMenuOpen(false);
        action();
    };

    return (
        <header className="support-chat-header">
            <span className="support-chat-header__avatar">
                <Image src={SUPPORT_AGENT_AVATAR} alt="" width={40} height={40} />
                <span className="support-chat-header__status" aria-hidden="true" />
            </span>
            <div className="support-chat-header__titles">
                <h2 id="support-chat-title">{SUPPORT_AGENT_NAME}</h2>
                <p>The team can also help</p>
            </div>
            <div className="support-chat-header__actions" ref={menuRef}>
                <button
                    type="button"
                    className="support-chat-icon-button"
                    aria-label="Chat options"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <MoreHorizontal size={20} aria-hidden="true" />
                </button>
                {menuOpen ? (
                    <div className="support-chat-menu" role="menu">
                        <button type="button" role="menuitem" onClick={choose(onRequestHuman)}>Talk to a person</button>
                        <button type="button" role="menuitem" onClick={choose(onReset)}>Start a new conversation</button>
                        <a role="menuitem" href="mailto:contact@zyenereviews.com">Email the team</a>
                    </div>
                ) : null}
                <button type="button" className="support-chat-icon-button" aria-label="Close chat" onClick={onClose}>
                    <X size={20} aria-hidden="true" />
                </button>
            </div>
        </header>
    );
}
