"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TAG_EMOJI_PICKER, type ReviewTagItem } from "@/lib/review-flow/tag-display";
import { MAX_CUSTOM_TAG_LENGTH } from "@/lib/review-flow/tags-for-ai";

export function ReviewTagChipEditorRow({
    item,
    index,
    canRemove,
    onUpdate,
    onRemove,
}: {
    item: ReviewTagItem;
    index: number;
    canRemove: boolean;
    onUpdate: (index: number, patch: Partial<Pick<ReviewTagItem, "emoji" | "label">>) => void;
    onRemove: (index: number) => void;
}) {
    return (
        <div
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2 dark:bg-muted/10"
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 rounded-lg p-0 text-lg size-10"
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
                                onClick={() => onUpdate(index, { emoji })}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            <Input
                value={item.label}
                onChange={(e) => onUpdate(index, { label: e.target.value })}
                placeholder="Tag label"
                maxLength={MAX_CUSTOM_TAG_LENGTH}
                className="h-10 flex-1 bg-background"
            />

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive size-10"
                onClick={() => onRemove(index)}
                disabled={!canRemove}
                aria-label="Remove tag"
            >
                <X className="size-4" />
            </Button>
        </div>
    );
}
