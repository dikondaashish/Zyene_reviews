import { Check, Reply } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ReplyTone } from "@/domains/ai/services/generateReplyDraft";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NeedsAttentionCopy, NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";
import { NeedsAttentionDraftComposer } from "@/components/dashboard/needs-attention-draft-composer";
import { NeedsAttentionDraftGeneratingState } from "@/components/dashboard/needs-attention-draft-generating-state";
import { NeedsAttentionDraftStartButtons } from "@/components/dashboard/needs-attention-draft-start-buttons";
import { NeedsAttentionYelpReplyNotice } from "@/components/dashboard/needs-attention-yelp-reply-notice";

export function NeedsAttentionReviewExpanded({
    review,
    copy,
    id,
    draft,
    draftsRecord,
    isGen,
    isSub,
    isSent,
    typing,
    isDemo,
    planAllowsAiReplies,
    isYelp,
    manualCompose,
    tones,
    setDrafts,
    setManualCompose,
    stopAiStream,
    runDraft,
    sendReply,
}: {
    review: NeedsAttentionReview;
    copy: NeedsAttentionCopy;
    id: string;
    draft: string;
    draftsRecord: Record<string, string>;
    isGen: boolean;
    isSub: boolean;
    isSent: boolean;
    typing: boolean;
    isDemo: boolean;
    planAllowsAiReplies: boolean;
    isYelp: boolean;
    manualCompose: Record<string, boolean>;
    tones: Record<string, ReplyTone>;
    setDrafts: Dispatch<SetStateAction<Record<string, string>>>;
    setManualCompose: Dispatch<SetStateAction<Record<string, boolean>>>;
    stopAiStream: (streamId: string) => void;
    runDraft: (r: NeedsAttentionReview, tone?: ReplyTone, opts?: { bypassCache?: boolean }) => void;
    sendReply: (r: NeedsAttentionReview) => void;
}) {
    const hasDraftKey = id in draftsRecord;

    return (
        <div
            className={cn(
                "border-t border-border bg-muted/50 px-4 pb-4 pt-3 sm:px-5",
                "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            )}
        >
            <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-3.5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Reply className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {copy.yourReplyLabel}
                    </span>
                    {isSent ? (
                        <Badge
                            variant="secondary"
                            className="border-chart-2/30 bg-chart-2/15 text-chart-2 dark:bg-chart-2/20"
                        >
                            <Check className="mr-1 h-3 w-3" aria-hidden />
                            {copy.sentToGoogle}
                        </Badge>
                    ) : null}
                </div>

                {isYelp ? (
                    <NeedsAttentionYelpReplyNotice />
                ) : (
                    <>
                        {!isGen && !manualCompose[id] && !hasDraftKey ? (
                            <NeedsAttentionDraftStartButtons
                                copy={copy}
                                onStartAiDraft={() => void runDraft(review, "professional")}
                                onChooseManual={() => {
                                    setManualCompose((m) => ({ ...m, [id]: true }));
                                    setDrafts((d) => ({ ...d, [id]: "" }));
                                }}
                            />
                        ) : null}

                        {isGen ? <NeedsAttentionDraftGeneratingState copy={copy} /> : null}

                        {(manualCompose[id] || hasDraftKey) && !isGen ? (
                            <NeedsAttentionDraftComposer
                                review={review}
                                copy={copy}
                                id={id}
                                draft={draft}
                                isGen={isGen}
                                isSub={isSub}
                                typing={typing}
                                isSent={isSent}
                                isDemo={isDemo}
                                planAllowsAiReplies={planAllowsAiReplies}
                                tones={tones}
                                onDraftChange={(value) => {
                                    setDrafts((d) => ({
                                        ...d,
                                        [id]: value,
                                    }));
                                }}
                                onStopStream={stopAiStream}
                                onRunDraft={runDraft}
                                onSendReply={sendReply}
                            />
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
}
