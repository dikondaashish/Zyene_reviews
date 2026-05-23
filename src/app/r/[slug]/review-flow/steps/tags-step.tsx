import {
    ArrowLeft,
    ChevronRight,
    Pencil,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTagForDisplay } from "@/lib/review-flow/tag-display";
import {
    EVERYTHING_TAG,
    MAX_CUSTOM_TAG_CHIPS,
    normalizeCustomTagInput,
} from "@/lib/review-flow/tags-for-ai";

export interface TagsStepProps {
    resolvedBrandColor: string;
    tagsHeading?: string;
    tagsSubheading?: string;
    tags: string[];
    categoryKey: string;
    selectedTags: string[];
    showCustomInput: boolean;
    customTagInput: string;
    addedCustomTags: string[];
    hasTagSelection: boolean;
    enableStaffSelection: boolean;
    staffNames: string[];
    selectedStaff: string[];
    onToggleTag: (tag: string) => void;
    onToggleEverything: () => void;
    onOpenCustomInputPanel: () => void;
    onToggleCustomInput: () => void;
    onCustomTagInputChange: (value: string) => void;
    onAddCustomTag: () => void;
    onRemoveCustomTag: (index: number) => void;
    onToggleStaff: (name: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function TagsStep({
    resolvedBrandColor,
    tagsHeading,
    tagsSubheading,
    tags,
    categoryKey,
    selectedTags,
    showCustomInput,
    customTagInput,
    addedCustomTags,
    hasTagSelection,
    enableStaffSelection,
    staffNames,
    selectedStaff,
    onToggleTag,
    onToggleEverything,
    onOpenCustomInputPanel,
    onToggleCustomInput,
    onCustomTagInputChange,
    onAddCustomTag,
    onRemoveCustomTag,
    onToggleStaff,
    onContinue,
    onBack,
}: TagsStepProps) {
    const tagActionBtnClass =
        "w-full min-h-11 rounded-xl text-sm font-semibold transition-all duration-200 border-2 active:scale-[0.98]";

    return (
        <div className="px-6 pt-7 pb-0 animate-in fade-in slide-in-from-right-4 duration-400">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: resolvedBrandColor }} />
                    <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: resolvedBrandColor }} />
                    <div className="h-1.5 flex-1 bg-muted rounded-full dark:bg-[rgb(51,65,85)]" />
                </div>

                <div className="text-center space-y-0.5">
                    <h2 className="text-xl font-bold text-foreground leading-snug">
                        {tagsHeading || "What did you like most?"}
                    </h2>
                    <p className="text-muted-foreground text-xs">
                        {tagsSubheading || "Tap to select what stood out"}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {tags.map((tag) => {
                        const { emoji, label } = formatTagForDisplay(tag, categoryKey);
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => onToggleTag(tag)}
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-3.5 py-2 min-h-10 rounded-full text-sm font-medium transition-all duration-200",
                                    "border-2 active:scale-95",
                                    selectedTags.includes(tag)
                                        ? "text-primary-foreground dark:text-white dark:border-white/25 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.45)] scale-105 shadow-md"
                                        : "bg-background text-muted-foreground border-border hover:bg-muted dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:hover:bg-[rgb(51,65,85)]"
                                )}
                                style={{
                                    backgroundColor: selectedTags.includes(tag) ? resolvedBrandColor : undefined,
                                    borderColor: selectedTags.includes(tag) ? resolvedBrandColor : undefined,
                                }}
                            >
                                <span className="text-base leading-none" aria-hidden>{emoji}</span>
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={onToggleEverything}
                        className={cn(
                            tagActionBtnClass,
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

                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() =>
                                showCustomInput ? onToggleCustomInput() : onOpenCustomInputPanel()
                            }
                            className={cn(
                                tagActionBtnClass,
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
                </div>

                {enableStaffSelection && staffNames.length > 0 && (
                    <div className="pt-3 border-t border-border dark:border-white/10">
                        <p className="text-center text-sm font-medium text-foreground mb-2">
                            Who served you?{" "}
                            <span className="font-normal text-muted-foreground">(optional)</span>
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {staffNames.map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => onToggleStaff(name)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3.5 py-2 min-h-10 rounded-full text-sm font-medium transition-all duration-200",
                                        "border-2 active:scale-95",
                                        selectedStaff.includes(name)
                                            ? "text-primary-foreground dark:text-white dark:border-white/25 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.45)] scale-105 shadow-md"
                                            : "bg-background text-muted-foreground border-border hover:bg-muted dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:hover:bg-[rgb(51,65,85)]"
                                    )}
                                    style={{
                                        backgroundColor: selectedStaff.includes(name) ? resolvedBrandColor : undefined,
                                        borderColor: selectedStaff.includes(name) ? resolvedBrandColor : undefined,
                                    }}
                                >
                                    <span>👤</span>
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {hasTagSelection && (
                    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <button
                            type="button"
                            className={cn(
                                "w-full min-h-12 rounded-xl text-base font-semibold text-primary-foreground transition-all duration-300",
                                "dark:text-white",
                                "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary",
                                "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                                "active:scale-[0.98] flex items-center justify-center gap-2"
                            )}
                            onClick={onContinue}
                        >
                            Continue
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            <button
                type="button"
                className="mt-6 mb-2 flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors mx-auto"
                onClick={onBack}
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
            </button>
        </div>
    );
}
