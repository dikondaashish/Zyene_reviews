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
    return (
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
    );
}
