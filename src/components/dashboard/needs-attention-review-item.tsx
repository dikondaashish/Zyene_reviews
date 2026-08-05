import type { ReplyTone } from "@/domains/ai/services/generate-reply-draft";
import type { Dispatch, SetStateAction } from "react";
import type { NeedsAttentionCopy, NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";
import { NeedsAttentionReviewExpanded } from "@/components/dashboard/needs-attention-review-expanded";
import { NeedsAttentionReviewRowTrigger } from "@/components/dashboard/needs-attention-review-row-trigger";

export function NeedsAttentionReviewItem({
    review,
    copy,
    open,
    draft,
    draftsRecord,
    isGen,
    isSub,
    isSent,
    typing,
    isDemo,
    planAllowsAiReplies,
    manualCompose,
    tones,
    setDrafts,
    setManualCompose,
    stopAiStream,
    runDraft,
    sendReply,
    onToggleRow,
}: {
    review: NeedsAttentionReview;
    copy: NeedsAttentionCopy;
    open: boolean;
    draft: string;
    draftsRecord: Record<string, string>;
    isGen: boolean;
    isSub: boolean;
    isSent: boolean;
    typing: boolean;
    isDemo: boolean;
    planAllowsAiReplies: boolean;
    manualCompose: Record<string, boolean>;
    tones: Record<string, ReplyTone>;
    setDrafts: Dispatch<SetStateAction<Record<string, string>>>;
    setManualCompose: Dispatch<SetStateAction<Record<string, boolean>>>;
    stopAiStream: (streamId: string) => void;
    runDraft: (r: NeedsAttentionReview, tone?: ReplyTone, opts?: { bypassCache?: boolean }) => void;
    sendReply: (r: NeedsAttentionReview) => void;
    onToggleRow: (id: string) => void;
}) {
    const id = review.id;
    const platform = review.platform ?? "google";
    const isYelp = platform === "yelp";

    return (
        <li className="bg-card">
            <NeedsAttentionReviewRowTrigger
                review={review}
                copy={copy}
                open={open}
                isSent={isSent}
                onToggle={() => onToggleRow(id)}
            />
            {open ? (
                <NeedsAttentionReviewExpanded
                    review={review}
                    copy={copy}
                    id={id}
                    draft={draft}
                    draftsRecord={draftsRecord}
                    isGen={isGen}
                    isSub={isSub}
                    isSent={isSent}
                    typing={typing}
                    isDemo={isDemo}
                    planAllowsAiReplies={planAllowsAiReplies}
                    isYelp={isYelp}
                    manualCompose={manualCompose}
                    tones={tones}
                    setDrafts={setDrafts}
                    setManualCompose={setManualCompose}
                    stopAiStream={stopAiStream}
                    runDraft={runDraft}
                    sendReply={sendReply}
                />
            ) : null}
        </li>
    );
}
