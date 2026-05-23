"use client";

import {
    parseTagsToItems,
    sanitizeTagItems,
    type ReviewTagItem,
} from "@/lib/review-flow/tag-display";
import { ReviewTagChipEditorActions } from "./review-tag-chip-editor-actions";
import { ReviewTagChipEditorRow } from "./review-tag-chip-editor-row";

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
                    <ReviewTagChipEditorRow
                        key={`${item.display}-${index}`}
                        item={item}
                        index={index}
                        canRemove={items.length > 1}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                    />
                ))}
            </div>

            <ReviewTagChipEditorActions
                itemCount={items.length}
                onAdd={addItem}
                onReset={resetToDefaults}
            />
        </div>
    );
}
