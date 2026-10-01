import { readableForeground } from "@/lib/design/contrast";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
            aria-pressed={selectedTags.includes(EVERYTHING_TAG)}
            className={cn(
                TAG_ACTION_BTN_CLASS,
                selectedTags.includes(EVERYTHING_TAG)
                    ? "text-primary-foreground"
                    : "text-foreground border-border hover:bg-muted dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:hover:bg-[rgb(51,65,85)]"
            )}
            style={{
                color: selectedTags.includes(EVERYTHING_TAG) ? readableForeground(resolvedBrandColor) : undefined,
                backgroundColor: selectedTags.includes(EVERYTHING_TAG)
                    ? resolvedBrandColor
                    : undefined,
                borderColor: selectedTags.includes(EVERYTHING_TAG)
                    ? resolvedBrandColor
                    : undefined,
            }}
        >
            <Check className="size-4" aria-hidden="true" />
            Everything
        </button>
    );
}
