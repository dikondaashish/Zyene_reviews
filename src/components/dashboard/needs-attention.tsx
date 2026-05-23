"use client";

import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/settings/upgrade-modal";
import type { NeedsAttentionCopy, NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";

export type { NeedsAttentionCopy, NeedsAttentionReview };
import { NeedsAttentionEmpty } from "@/components/dashboard/needs-attention-empty";
import { NeedsAttentionReviewItem } from "@/components/dashboard/needs-attention-review-item";
import { NeedsAttentionSectionHeader } from "@/components/dashboard/needs-attention-section-header";
import { useNeedsAttentionController } from "@/components/dashboard/use-needs-attention-controller";

export function NeedsAttention({
    reviews,
    viewAllHref = "/reviews?status=needs_response&sort=lowest",
    copy: copyProp,
    className,
    planAllowsAiReplies = true,
    isDemo = false,
}: {
    reviews: NeedsAttentionReview[];
    viewAllHref?: string;
    copy?: Partial<NeedsAttentionCopy>;
    className?: string;
    /** Starter+ ,  same gate as the reviews inbox AI suggester. */
    planAllowsAiReplies?: boolean;
    /** Simulated drafts only; posting to Google is disabled. */
    isDemo?: boolean;
}) {
    const ctl = useNeedsAttentionController({
        copy: copyProp,
        planAllowsAiReplies,
        isDemo,
    });

    if (reviews.length === 0) {
        return <NeedsAttentionEmpty copy={ctl.copy} className={className} />;
    }

    const urgentCount = reviews.length;

    return (
        <div
            className={cn(
                "overflow-hidden rounded-[14px] border border-border bg-card text-card-foreground shadow-sm",
                className
            )}
        >
            <NeedsAttentionSectionHeader copy={ctl.copy} viewAllHref={viewAllHref} urgentCount={urgentCount} />

            <ul className="max-h-[min(480px,58vh)] divide-y divide-border overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                {reviews.map((review) => {
                    const id = review.id;
                    const open = ctl.expandedId === id;
                    return (
                        <NeedsAttentionReviewItem
                            key={id}
                            review={review}
                            copy={ctl.copy}
                            open={open}
                            draft={ctl.drafts[id] ?? ""}
                            draftsRecord={ctl.drafts}
                            isGen={!!ctl.generating[id]}
                            isSub={!!ctl.submitting[id]}
                            isSent={!!ctl.sent[id]}
                            typing={!!ctl.aiTyping[id]}
                            isDemo={isDemo}
                            planAllowsAiReplies={planAllowsAiReplies}
                            manualCompose={ctl.manualCompose}
                            tones={ctl.tones}
                            setDrafts={ctl.setDrafts}
                            setManualCompose={ctl.setManualCompose}
                            stopAiStream={ctl.stopAiStream}
                            runDraft={ctl.runDraft}
                            sendReply={ctl.sendReply}
                            onToggleRow={ctl.toggleRow}
                        />
                    );
                })}
            </ul>

            <UpgradeModal
                isOpen={ctl.showUpgradeModal}
                onClose={() => ctl.setShowUpgradeModal(false)}
                context={ctl.upgradeModalKind === "plan" ? "ai_reply_plan" : "ai_reply_limit"}
            />
        </div>
    );
}
