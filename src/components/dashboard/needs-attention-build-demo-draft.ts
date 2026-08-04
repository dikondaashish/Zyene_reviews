import type { ReplyTone } from "@/domains/ai/services/generate-reply-draft";
import type { NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";
import { formatThemeTag } from "@/components/dashboard/needs-attention-format-helpers";

/** Demo / offline fallback only — mirrors professional / friendly / concise intent. */
export function buildDemoDraft(review: NeedsAttentionReview, tone: ReplyTone): string {
    const first = review.author.split(/\s+/)[0] || "there";
    const snippet = review.text.trim().slice(0, 200);
    const tagLine =
        review.tags.length > 0
            ? ` We’re also reviewing your note on ${review.tags.slice(0, 2).map(formatThemeTag).join(" & ")}.`
            : "";

    if (tone === "concise") {
        return `Hi ${first},\n\nThank you for the feedback — we’re sorry we missed the mark.${tagLine}\n\nPlease contact us directly so we can make this right.\n\n— The owner`;
    }
    if (tone === "friendly") {
        return `Hi ${first},\n\nThanks so much for telling us about this — we really appreciate you taking the time.${tagLine}\n\nWe’re sorry you had a rough experience and we’d love the chance to make it better. Reach out anytime and we’ll take care of you personally.\n\nWarmly,\n— The owner`;
    }
    return `Hi ${first},\n\nThank you for your honest feedback. I’m sorry we fell short on this visit.${tagLine}\n\nWe’re addressing this with our team right away, and I’d welcome the opportunity to make it right for you.\n\n${snippet ? `You mentioned: “${snippet}${review.text.length > 200 ? "…" : ""}”\n\n` : ""}Please reach out if you’d like to connect directly.\n\nRespectfully,\n— The owner`;
}
