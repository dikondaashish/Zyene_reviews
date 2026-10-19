"use client";

import { Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const EMOJIS = ["😀", "😊", "🙂", "😍", "🤔", "😅", "🙏", "👍", "👋", "🎉", "⭐", "🔥", "❤️", "💡", "✅", "📈"];

export function SupportChatEmojiPicker({ onPick, disabled }: { onPick: (emoji: string) => void; disabled?: boolean }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointer = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", onPointer);
        return () => document.removeEventListener("pointerdown", onPointer);
    }, [open]);

    return (
        <div className="support-chat-emoji" ref={rootRef}>
            <button
                type="button"
                className="support-chat-icon-button"
                aria-label="Insert emoji"
                aria-expanded={open}
                disabled={disabled}
                onClick={() => setOpen((value) => !value)}
            >
                <Smile size={18} aria-hidden="true" />
            </button>
            {open ? (
                <div className="support-chat-emoji__grid" role="listbox" aria-label="Emoji">
                    {EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            role="option"
                            aria-selected="false"
                            onClick={() => {
                                onPick(emoji);
                                setOpen(false);
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
