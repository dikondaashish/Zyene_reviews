"use client";

import { Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    parseTagsToItems,
    sanitizeTagItems,
    TAG_EMOJI_PICKER,
    type ReviewTagItem,
} from "@/lib/review-flow/tag-display";
import { MAX_CUSTOM_TAG_LENGTH } from "@/lib/review-flow/tags-for-ai";

const MAX_TAGS = 12;

type ReviewTagChipEditorProps = {
    category: string;
    items: ReviewTagItem[];
    onChange: (items: ReviewTagItem[]) => void;
};

export function ReviewTagChipEditor({
    category,
    items,
    onChange,
}: ReviewTagChipEditorProps) {
    const updateItem = (index: number, patch: Partial<Pick<ReviewTagItem, "emoji" | "label">>) => {
        const next = items.map((item, i) => {
            if (i !== index) return item;
            const emoji = patch.emoji ?? item.emoji;
            const label = patch.label ?? item.label;
            const display = label.trim() ? `${emoji} ${label.trim()}` : emoji;
            return { ...item, emoji, label, display, raw: display };
        });
        onChange(sanitizeTagItems(next));
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const addItem = () => {
        if (items.length >= MAX_TAGS) return;
        const next: ReviewTagItem = {
            emoji: "⭐",
            label: "",
            raw: "⭐ ",
            display: "⭐ ",
        };
        onChange([...items, next]);
    };

    const resetToDefaults = () => {
        onChange(parseTagsToItems(null, category));
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div
                        key={`${item.display}-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2 dark:bg-muted/10"
                    >
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-10 shrink-0 rounded-lg p-0 text-lg"
                                    aria-label={`Icon for ${item.label || "tag"}`}
                                >
                                    {item.emoji || "⭐"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="start">
                                <div className="grid grid-cols-5 gap-1">
                                    {TAG_EMOJI_PICKER.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            className={cn(
                                                "h-9 rounded-md text-lg hover:bg-muted transition-colors",
                                                item.emoji === emoji && "bg-primary/15 ring-1 ring-primary/40"
                                            )}
                                            onClick={() => updateItem(index, { emoji })}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Input
                            value={item.label}
                            onChange={(e) => updateItem(index, { label: e.target.value })}
                            placeholder="Tag label"
                                        maxLength={MAX_CUSTOM_TAG_LENGTH}
                            className="h-10 flex-1 bg-background"
                        />

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(index)}
                            disabled={items.length <= 1}
                            aria-label="Remove tag"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={addItem}
                    disabled={items.length >= MAX_TAGS}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add tag
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    onClick={resetToDefaults}
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to category defaults
                </Button>
            </div>

            {items.length >= MAX_TAGS && (
                <p className="text-xs text-muted-foreground">{MAX_TAGS} tags max</p>
            )}
        </div>
    );
}
