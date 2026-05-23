import { Check, Loader2, RefreshCw, Send } from "lucide-react";
import type { ReplyTone } from "@/domains/ai/services/generateReplyDraft";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NeedsAttentionCopy, NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";

export function NeedsAttentionDraftReplyToolbar({
    review,
    copy,
    id,
    draft,
    isSub,
    typing,
    isDemo,
    isSent,
    tones,
    onRunDraft,
    onSendReply,
}: {
    review: NeedsAttentionReview;
    copy: NeedsAttentionCopy;
    id: string;
    draft: string;
    isSub: boolean;
    typing: boolean;
    isDemo: boolean;
    isSent: boolean;
    tones: Record<string, ReplyTone>;
    onRunDraft: (r: NeedsAttentionReview, tone?: ReplyTone, opts?: { bypassCache?: boolean }) => void;
    onSendReply: (r: NeedsAttentionReview) => void;
}) {
    if (isSent) {
        return (
            <p className="flex items-center gap-1 text-sm font-medium text-chart-2">
                <Check className="h-4 w-4" aria-hidden />
                {copy.sent}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-muted-foreground"
                    disabled={isSub}
                    onClick={() =>
                        void onRunDraft(review, tones[id] ?? "professional", {
                            bypassCache: true,
                        })
                    }
                >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    {copy.regenerate}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                            {copy.adjustTone} ▾
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => void onRunDraft(review, "professional")}>
                            {copy.toneProfessional}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void onRunDraft(review, "friendly")}>
                            {copy.toneFriendly}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => void onRunDraft(review, "concise")}>
                            {copy.toneConcise}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex w-full flex-col gap-1 sm:w-auto sm:items-end">
                <Button
                    type="button"
                    className="w-full gap-2 bg-primary text-primary-foreground hover:brightness-95 sm:w-auto"
                    disabled={isSub || !draft.trim() || typing || isDemo}
                    onClick={() => void onSendReply(review)}
                >
                    {isSub ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                        <Send className="h-4 w-4" aria-hidden />
                    )}
                    {copy.sendReply}
                </Button>
                {isDemo ? (
                    <p className="text-left text-[10px] text-muted-foreground sm:max-w-[220px] sm:text-right">
                        {copy.demoSendHint}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
