"use client";

import { SupportChatMessageText } from "@/components/marketing/support-chat/support-chat-message-text";
import { useTypewriter } from "@/hooks/use-typewriter";

interface AgentBubbleProps {
    text: string;
    /** True only for the newest reply; restored history renders in full at once. */
    animate: boolean;
    /** False while the reply is still streaming in. */
    complete: boolean;
    onDone?: () => void;
    /** Set for a team member's live reply (from Slack). */
    teamMember?: string;
}

export function SupportChatAgentBubble({ text, animate, complete, onDone, teamMember }: AgentBubbleProps) {
    const { visible, typing } = useTypewriter(text, animate, complete, onDone);
    return (
        <div className={`support-chat-bubble support-chat-bubble--agent${teamMember ? " support-chat-bubble--team" : ""}`}>
            {teamMember ? <p className="support-chat-team-label">{teamMember} · Team</p> : null}
            {typing ? (
                <>
                    {/* Screen readers get the whole reply once it is complete, not one letter at a time. */}
                    {complete ? <span className="sr-only">{text}</span> : null}
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
