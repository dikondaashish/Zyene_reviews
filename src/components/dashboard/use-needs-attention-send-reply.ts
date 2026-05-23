import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NEEDS_ATTENTION_UUID_RE } from "@/components/dashboard/needs-attention-constants";
import type { ReplyTone } from "@/domains/ai/services/generateReplyDraft";
import type { NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";

type ToneCache = Record<string, Partial<Record<ReplyTone, string>>>;

export function useNeedsAttentionSendReply({
    drafts,
    isDemo,
    copyDemoSendHint,
    stopAiStream,
    setSubmitting,
    setSent,
    setToneCache,
    setExpandedId,
    setUpgradeModalKind,
    setShowUpgradeModal,
}: {
    drafts: Record<string, string>;
    isDemo: boolean;
    copyDemoSendHint: string;
    stopAiStream: (id: string) => void;
    setSubmitting: Dispatch<SetStateAction<Record<string, boolean>>>;
    setSent: Dispatch<SetStateAction<Record<string, boolean>>>;
    setToneCache: Dispatch<SetStateAction<ToneCache>>;
    setExpandedId: Dispatch<SetStateAction<string | null>>;
    setUpgradeModalKind: Dispatch<SetStateAction<"limit" | "plan">>;
    setShowUpgradeModal: Dispatch<SetStateAction<boolean>>;
}) {
    const router = useRouter();

    return useCallback(
        async (review: NeedsAttentionReview) => {
            const id = review.id;
            const draft = drafts[id] ?? "";
            if (!draft.trim()) return;

            if ((review.platform ?? "google") === "yelp") {
                toast.error("Only Google reviews can be replied to from here.");
                return;
            }

            if (isDemo) {
                toast.message(copyDemoSendHint);
                return;
            }

            if (!NEEDS_ATTENTION_UUID_RE.test(id)) {
                toast.error("This review cannot be posted from here.");
                return;
            }

            stopAiStream(id);
            setSubmitting((s) => ({ ...s, [id]: true }));
            try {
                const res = await fetch(`/api/reviews/${id}/reply`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: draft }),
                });
                const data = (await res.json().catch(() => ({}))) as { error?: string };
                if (!res.ok) throw new Error(data.error || "Failed to reply");

                toast.success("Reply posted successfully");
                setSent((s) => ({ ...s, [id]: true }));
                setToneCache((tc) => {
                    const next = { ...tc };
                    delete next[id];
                    return next;
                });
                window.setTimeout(() => {
                    setExpandedId(null);
                    router.refresh();
                }, 1200);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : "Failed to reply";
                if (
                    message.includes("Monthly AI reply limit") ||
                    message.includes("upgrade your plan")
                ) {
                    setUpgradeModalKind("limit");
                    setShowUpgradeModal(true);
                } else {
                    toast.error(message);
                }
            } finally {
                setSubmitting((s) => ({ ...s, [id]: false }));
            }
        },
        [
            copyDemoSendHint,
            drafts,
            isDemo,
            router,
            setExpandedId,
            setSent,
            setShowUpgradeModal,
            setSubmitting,
            setToneCache,
            setUpgradeModalKind,
            stopAiStream,
        ]
    );
}
