import type { ReplyTone } from "@/domains/ai/services/generateReplyDraft";

export async function fetchSuggestReply(reviewId: string, tone: ReplyTone): Promise<string> {
    const res = await fetch("/api/ai/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, tone }),
    });
    const json = (await res.json()) as {
        success?: boolean;
        data?: { reply?: string };
        error?: string;
        code?: string;
    };
    if (!res.ok) {
        const err = new Error(json.error || "Failed to get suggestion") as Error & { code?: string };
        err.code = json.code;
        throw err;
    }
    if (json.success && json.data && typeof json.data.reply === "string") {
        return json.data.reply;
    }
    throw new Error("Invalid AI response");
}
