"use client";

import { SupportChatMessageText } from "@/components/marketing/support-chat/support-chat-message-text";
import { useTypewriter } from "@/hooks/use-typewriter";

interface AgentBubbleProps {
    text: string;
    /** True only for the newest reply; restored history renders in full at once. */
    animate: boolean;
    onDone?: () => void;
}

export function SupportChatAgentBubble({ text, animate, onDone }: AgentBubbleProps) {
    const { visible, typing } = useTypewriter(text, animate, onDone);
    return (
        <div className="support-chat-bubble support-chat-bubble--agent">
            {typing ? (
                <>
                    {/* Screen readers get the whole reply once, not one letter at a time. */}
                    <span className="sr-only">{text}</span>
                    <div aria-hidden="true">
                        <SupportChatMessageText text={visible} trailing={<span className="support-chat-caret" />} />
                    </div>
                </>
            ) : (
                <SupportChatMessageText text={visible} />
            )}
        </div>
    );
}
