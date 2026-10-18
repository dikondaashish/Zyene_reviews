import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/safe-storage";
import type { SupportChatMessage } from "@/lib/support-chat/constants";

const STORAGE_KEY = "zyene-support-chat-v1";
const TEASER_KEY = "zyene-support-chat-teaser-dismissed";

export interface StoredChatMessage extends SupportChatMessage {
    createdAt: number;
}

export interface SupportChatState {
    sessionId: string;
    messages: StoredChatMessage[];
    /** Counts across "new conversation" resets so the lead prompt cannot be dodged. */
    questionsAsked: number;
    leadSubmitted: boolean;
    email: string;
}

export function newSessionId(): string {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function emptyChatState(): SupportChatState {
    return { sessionId: newSessionId(), messages: [], questionsAsked: 0, leadSubmitted: false, email: "" };
}

export function loadChatState(): SupportChatState {
    const raw = safeLocalStorageGet(STORAGE_KEY);
    if (!raw) return emptyChatState();
    try {
        const parsed = JSON.parse(raw) as Partial<SupportChatState>;
        if (typeof parsed.sessionId !== "string" || !Array.isArray(parsed.messages)) return emptyChatState();
        return {
            sessionId: parsed.sessionId,
            messages: parsed.messages.filter(
                (m): m is StoredChatMessage =>
                    !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
            ).slice(-40),
            questionsAsked: Number(parsed.questionsAsked) || 0,
            leadSubmitted: parsed.leadSubmitted === true,
            email: typeof parsed.email === "string" ? parsed.email : "",
        };
    } catch {
        return emptyChatState();
    }
}

export function saveChatState(state: SupportChatState): void {
    safeLocalStorageSet(STORAGE_KEY, JSON.stringify(state));
}

export function isTeaserDismissed(): boolean {
    try {
        return sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {
        return false;
    }
}

export function dismissTeaser(): void {
    try {
        sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
        // Teaser simply shows again next page when storage is blocked.
    }
}

export function formatRelativeTime(timestamp: number, now = Date.now()): string {
    const minutes = Math.floor((now - timestamp) / 60_000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
