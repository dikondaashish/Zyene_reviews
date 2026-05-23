import { useCallback, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import type { ReplyTone } from "@/domains/ai/services/generateReplyDraft";
import { NEEDS_ATTENTION_UUID_RE } from "@/components/dashboard/needs-attention-constants";
import { buildDemoDraft } from "@/components/dashboard/needs-attention-build-demo-draft";
import { fetchSuggestReply } from "@/components/dashboard/needs-attention-fetch-suggest-reply";
import type { NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";

type ToneCache = Record<string, Partial<Record<ReplyTone, string>>>;

export function useNeedsAttentionRunDraft({
    isDemo,
    planAllowsAiReplies,
    tones,
    toneCache,
    setTones,
    setGenerating,
    setToneCache,
    setUpgradeModalKind,
    setShowUpgradeModal,
    startAiStream,
    stopAiStream,
}: {
    isDemo: boolean;
    planAllowsAiReplies: boolean;
    tones: Record<string, ReplyTone>;
    toneCache: ToneCache;
    setTones: Dispatch<SetStateAction<Record<string, ReplyTone>>>;
    setGenerating: Dispatch<SetStateAction<Record<string, boolean>>>;
    setToneCache: Dispatch<SetStateAction<ToneCache>>;
    setUpgradeModalKind: Dispatch<SetStateAction<"limit" | "plan">>;
    setShowUpgradeModal: Dispatch<SetStateAction<boolean>>;
    startAiStream: (id: string, full: string) => void;
    stopAiStream: (id: string) => void;
}) {
    return useCallback(
        async (
            review: NeedsAttentionReview,
            toneOverride?: ReplyTone,
            opts?: { bypassCache?: boolean }
        ) => {
            const id = review.id;
            const tone: ReplyTone = toneOverride ?? tones[id] ?? "professional";
            const platform = review.platform ?? "google";

            if (platform === "yelp") {
                toast.error("Use Yelp for Business to reply to Yelp reviews.");
                return;
            }

            stopAiStream(id);

            if (!planAllowsAiReplies && !isDemo) {
                setUpgradeModalKind("plan");
                setShowUpgradeModal(true);
                return;
            }

            if (isDemo) {
                setTones((t) => ({ ...t, [id]: tone }));
                setGenerating((g) => ({ ...g, [id]: true }));
                try {
                    await new Promise((r) => setTimeout(r, 600));
                    const text = buildDemoDraft(review, tone);
                    setToneCache((tc) => ({
                        ...tc,
                        [id]: { ...tc[id], [tone]: text },
                    }));
                    startAiStream(id, text);
                } finally {
                    setGenerating((g) => ({ ...g, [id]: false }));
                }
                return;
            }

            if (!NEEDS_ATTENTION_UUID_RE.test(id)) {
                toast.error("This review cannot use AI drafting from here.");
                return;
            }

            setTones((t) => ({ ...t, [id]: tone }));

            const cached = !opts?.bypassCache ? toneCache[id]?.[tone] : undefined;
            if (cached) {
                startAiStream(id, cached);
                return;
            }

            setGenerating((g) => ({ ...g, [id]: true }));
            try {
                const reply = await fetchSuggestReply(id, tone);
                setToneCache((tc) => ({
                    ...tc,
                    [id]: { ...tc[id], [tone]: reply },
                }));
                startAiStream(id, reply);
            } catch (e: unknown) {
                const err = e as Error & { code?: string };
                const message = err?.message || "Failed to get suggestion";
                if (err.code === "AI_REPLY_PLAN_REQUIRED") {
                    setUpgradeModalKind("plan");
                    setShowUpgradeModal(true);
                } else if (
                    message.includes("Monthly AI reply limit") ||
                    message.includes("upgrade your plan")
                ) {
                    setUpgradeModalKind("limit");
                    setShowUpgradeModal(true);
                } else {
                    toast.error(message);
                }
            } finally {
                setGenerating((g) => ({ ...g, [id]: false }));
            }
        },
        [
            isDemo,
            planAllowsAiReplies,
            setGenerating,
            setShowUpgradeModal,
            setToneCache,
            setTones,
            setUpgradeModalKind,
            startAiStream,
            stopAiStream,
            toneCache,
            tones,
        ]
    );
}
