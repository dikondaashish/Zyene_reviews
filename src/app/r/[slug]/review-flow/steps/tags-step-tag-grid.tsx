import { Check } from "lucide-react";
import { readableForeground } from "@/lib/design/contrast";
import { cn } from "@/lib/utils";
import { formatTagForDisplay } from "@/lib/review-flow/tag-display";

export interface TagsStepTagGridProps {
    tags: string[];
    categoryKey: string;
    selectedTags: string[];
    resolvedBrandColor: string;
    onToggleTag: (tag: string) => void;
}

export function TagsStepTagGrid({
    tags,
    categoryKey,
    selectedTags,
    resolvedBrandColor,
    onToggleTag,
}: TagsStepTagGridProps) {
    const selected = new Set(selectedTags);
    return (
        <div className="grid grid-cols-2 gap-2.5">
            {tags.map((tag) => {
                const { emoji, label } = formatTagForDisplay(tag, categoryKey);
                return (
                    <button
                        key={tag}
                        type="button"
                        aria-pressed={selected.has(tag)}
                        onClick={() => onToggleTag(tag)}
                        className={cn(
                            "relative flex min-w-0 items-center gap-2 px-3 py-3 min-h-14 rounded-xl text-sm font-medium text-left transition-colors duration-150 motion-reduce:transition-none",
                            "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            selected.has(tag)
                                ? "text-primary-foreground"
                                : "bg-background text-foreground border-border hover:bg-muted dark:bg-[rgb(30,41,59)] dark:border-white/10 dark:hover:bg-[rgb(51,65,85)]"
                        )}
                        style={{
                            backgroundColor: selected.has(tag) ? resolvedBrandColor : undefined,
                            color: selected.has(tag) ? readableForeground(resolvedBrandColor) : undefined,
                            borderColor: selected.has(tag) ? resolvedBrandColor : undefined,
                        }}
                    >
                        <span className="shrink-0 text-lg leading-none" aria-hidden>{emoji}</span>
                        <span className="min-w-0 flex-1 break-words leading-snug">{label}</span>
                        {selected.has(tag) && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
                    </button>
                );
            })}
        </div>
    );
}
