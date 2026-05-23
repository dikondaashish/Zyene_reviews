import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NeedsAttentionCopy } from "@/components/dashboard/needs-attention-types";

export function NeedsAttentionDraftStartButtons({
    copy,
    onStartAiDraft,
    onChooseManual,
}: {
    copy: NeedsAttentionCopy;
    onStartAiDraft: () => void;
    onChooseManual: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-2 py-2">
            <Button
                type="button"
                className="gap-2"
                onClick={(e) => {
                    e.stopPropagation();
                    void onStartAiDraft();
                }}
            >
                <Sparkles className="h-4 w-4" aria-hidden />
                {copy.draftWithAi}
            </Button>
            <button
                type="button"
                className="text-[11px] text-primary underline-offset-2 hover:underline"
                onClick={(e) => {
                    e.stopPropagation();
                    onChooseManual();
                }}
            >
                {copy.writeYourOwn}
            </button>
        </div>
    );
}
