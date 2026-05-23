import type { ReplyTone } from "@/domains/ai/services/generateReplyDraft";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import type { NeedsAttentionCopy, NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";
import { NeedsAttentionDraftReplyToolbar } from "@/components/dashboard/needs-attention-draft-reply-toolbar";
import { NeedsAttentionDraftTonePicker } from "@/components/dashboard/needs-attention-draft-tone-picker";

export function NeedsAttentionDraftComposer({
    review,
    copy,
    id,
    draft,
    isGen,
    isSub,
    typing,
    isSent,
    isDemo,
    planAllowsAiReplies,
    tones,
    onDraftChange,
    onStopStream,
    onRunDraft,
    onSendReply,
}: {
    review: NeedsAttentionReview;
    copy: NeedsAttentionCopy;
    id: string;
    draft: string;
    isGen: boolean;
    isSub: boolean;
    typing: boolean;
    isSent: boolean;
    isDemo: boolean;
    planAllowsAiReplies: boolean;
    tones: Record<string, ReplyTone>;
    onDraftChange: (value: string) => void;
    onStopStream: (streamId: string) => void;
    onRunDraft: (
        r: NeedsAttentionReview,
        tone?: ReplyTone,
        opts?: { bypassCache?: boolean }
    ) => void;
    onSendReply: (r: NeedsAttentionReview) => void;
}) {
    return (
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            {planAllowsAiReplies || isDemo ? (
                <NeedsAttentionDraftTonePicker
                    copy={copy}
                    review={review}
                    id={id}
                    isGen={isGen}
                    isSub={isSub}
                    typing={typing}
                    tones={tones}
                    onRunDraft={onRunDraft}
                />
            ) : null}

            <div className="relative">
                <Textarea
                    value={draft}
                    onChange={(e) => {
                        if (typing) onStopStream(id);
                        onDraftChange(e.target.value);
                    }}
                    placeholder="Write your reply…"
                    className={cn(
                        "min-h-[110px] resize-y border-border bg-muted/40 text-[13px] text-foreground",
                        typing && "border-sync-action/30 ring-1 ring-sync-action/20"
                    )}
                    readOnly={isSent}
                    aria-busy={typing}
                />
                {typing ? (
                    <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-sync-action/20 bg-sync-action/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sync-action">
                        <span className="inline-block animate-pulse rounded-full bg-sync-action size-1.5" />
                        Writing
                    </span>
                ) : null}
            </div>

            <NeedsAttentionDraftReplyToolbar
                review={review}
                copy={copy}
                id={id}
                draft={draft}
                isSub={isSub}
                typing={typing}
                isDemo={isDemo}
                isSent={isSent}
                tones={tones}
                onRunDraft={onRunDraft}
                onSendReply={onSendReply}
            />
        </div>
    );
}
