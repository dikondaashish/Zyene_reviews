import { Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_CUSTOM_TAG_CHIPS, normalizeCustomTagInput } from "@/lib/review-flow/tags-for-ai";
import { TAG_ACTION_BTN_CLASS } from "./tags-step-types";

export interface TagsStepCustomInputProps {
    resolvedBrandColor: string;
    showCustomInput: boolean;
    customTagInput: string;
    addedCustomTags: string[];
    onOpenCustomInputPanel: () => void;
    onToggleCustomInput: () => void;
    onCustomTagInputChange: (value: string) => void;
    onAddCustomTag: () => void;
    onRemoveCustomTag: (index: number) => void;
}

export function TagsStepCustomInput({
    resolvedBrandColor,
    showCustomInput,
    customTagInput,
    addedCustomTags,
    onOpenCustomInputPanel,
    onToggleCustomInput,
    onCustomTagInputChange,
    onAddCustomTag,
    onRemoveCustomTag,
}: TagsStepCustomInputProps) {
    return (
        <div className="space-y-2">
            <button
                type="button"
                onClick={() => (showCustomInput ? onToggleCustomInput() : onOpenCustomInputPanel())}
                className={cn(
                    TAG_ACTION_BTN_CLASS,
                    "flex items-center justify-center gap-2",
                    showCustomInput || addedCustomTags.length > 0
                        ? "text-primary-foreground dark:text-white dark:border-white/25 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.45)] shadow-md"
                        : "text-foreground border-border hover:bg-muted dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:hover:bg-[rgb(51,65,85)]"
                )}
                style={{
                    backgroundColor:
                        showCustomInput || addedCustomTags.length > 0
                            ? resolvedBrandColor
                            : undefined,
                    borderColor:
                        showCustomInput || addedCustomTags.length > 0
                            ? resolvedBrandColor
                            : undefined,
                }}
            >
                <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                Add your own words
            </button>

            {showCustomInput && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customTagInput}
                            onChange={(e) => onCustomTagInputChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    onAddCustomTag();
                                }
                            }}
                            placeholder="What stood out?"
                            inputMode="text"
                            enterKeyHint="done"
                            maxLength={80}
                            disabled={addedCustomTags.length >= MAX_CUSTOM_TAG_CHIPS}
                            className="flex-1 min-w-0 h-11 px-3 rounded-xl border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none dark:bg-[rgb(30,41,59)] dark:border-white/10"
                        />
                        <button
                            type="button"
                            onClick={onAddCustomTag}
                            disabled={
                                !normalizeCustomTagInput(customTagInput) ||
                                addedCustomTags.length >= MAX_CUSTOM_TAG_CHIPS
                            }
                            className="h-11 px-4 rounded-xl text-sm font-semibold text-primary-foreground bg-primary disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            style={{ backgroundColor: resolvedBrandColor }}
                        >
                            Add
                        </button>
                    </div>
                    {addedCustomTags.length >= MAX_CUSTOM_TAG_CHIPS && (
                        <p className="text-xs text-muted-foreground text-center">
                            4 max — remove one to add another
                        </p>
                    )}
                </div>
            )}

            {addedCustomTags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                    {addedCustomTags.map((tag, index) => (
                        <span
                            key={`${tag}-${index}`}
                            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full text-sm font-medium border-2 text-primary-foreground dark:text-white"
                            style={{
                                backgroundColor: resolvedBrandColor,
                                borderColor: resolvedBrandColor,
                            }}
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemoveCustomTag(index)}
                                className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20"
                                aria-label={`Remove ${tag}`}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
