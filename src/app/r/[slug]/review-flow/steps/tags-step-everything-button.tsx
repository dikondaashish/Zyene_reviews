import { cn } from "@/lib/utils";
import { EVERYTHING_TAG } from "@/lib/review-flow/tags-for-ai";
import { TAG_ACTION_BTN_CLASS } from "./tags-step-types";

export interface TagsStepEverythingButtonProps {
    resolvedBrandColor: string;
    selectedTags: string[];
    onToggleEverything: () => void;
}

export function TagsStepEverythingButton({
    resolvedBrandColor,
    selectedTags,
    onToggleEverything,
}: TagsStepEverythingButtonProps) {
    return (
        <button
            type="button"
            onClick={onToggleEverything}
            className={cn(
                TAG_ACTION_BTN_CLASS,
                selectedTags.includes(EVERYTHING_TAG)
                    ? "text-primary-foreground dark:text-white dark:border-white/25 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.45)] shadow-md"
                    : "text-foreground border-border hover:bg-muted dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:hover:bg-[rgb(51,65,85)]"
            )}
            style={{
                backgroundColor: selectedTags.includes(EVERYTHING_TAG)
                    ? resolvedBrandColor
                    : undefined,
                borderColor: selectedTags.includes(EVERYTHING_TAG)
                    ? resolvedBrandColor
                    : undefined,
            }}
        >
            👍 Everything!
        </button>
    );
}
