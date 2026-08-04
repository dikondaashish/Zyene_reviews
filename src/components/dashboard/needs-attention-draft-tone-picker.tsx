import { Sparkles } from "lucide-react";
import type { ReplyTone } from "@/domains/ai/services/generate-reply-draft";
import { cn } from "@/lib/utils";
import type { NeedsAttentionCopy, NeedsAttentionReview } from "@/components/dashboard/needs-attention-types";

const TONES = ["professional", "friendly", "concise"] as const;

export function NeedsAttentionDraftTonePicker({
    copy,
    review,
    id,
    isGen,
    isSub,
    typing,
    tones,
    onRunDraft,
}: {
    copy: NeedsAttentionCopy;
    review: NeedsAttentionReview;
    id: string;
    isGen: boolean;
    isSub: boolean;
    typing: boolean;
    tones: Record<string, ReplyTone>;
    onRunDraft: (r: NeedsAttentionReview, tone?: ReplyTone, opts?: { bypassCache?: boolean }) => void;
}) {
    return (
        <div className="mb-3 flex flex-wrap items-center gap-2">
            <Sparkles className="text-sync-action size-3.5" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI tone</span>
            <div className="flex flex-wrap gap-1.5">
                {TONES.map((tone) => (
                    <button
                        key={tone}
                        type="button"
                        disabled={isGen || isSub || typing}
                        onClick={() => void onRunDraft(review, tone)}
                        className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-semibold capitalize transition-colors",
                            (tones[id] ?? "professional") === tone
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted"
                        )}
                    >
                        {tone === "professional" && copy.toneProfessional}
                        {tone === "friendly" && copy.toneFriendly}
                        {tone === "concise" && copy.toneConcise}
                    </button>
                ))}
            </div>
        </div>
    );
}
