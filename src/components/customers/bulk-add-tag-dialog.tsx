"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 80;

/** "vip, Repeat  ,vip" → ["vip", "Repeat"]: trimmed, de-duplicated, within the bulk API limits. */
export function parseTagInput(input: string): string[] {
    const seen = new Set<string>();
    const tags: string[] = [];
    for (const raw of input.split(",")) {
        const tag = raw.trim().slice(0, MAX_TAG_LENGTH);
        const key = tag.toLowerCase();
        if (!tag || seen.has(key)) continue;
        seen.add(key);
        tags.push(tag);
    }
    return tags.slice(0, MAX_TAGS);
}

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    existingTags: string[];
    onConfirm: (tags: string[]) => void;
};

export function BulkAddTagDialog({ open, onOpenChange, selectedCount, existingTags, onConfirm }: Props) {
    const [value, setValue] = useState("");
    const tags = parseTagInput(value);

    const close = (next: boolean) => {
        if (!next) setValue("");
        onOpenChange(next);
    };

    const addSuggestion = (tag: string) => {
        if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
        setValue(tags.length ? `${tags.join(", ")}, ${tag}` : tag);
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (tags.length === 0) return;
                        onConfirm(tags);
                        close(false);
                    }}
                    className="space-y-4"
                >
                    <DialogHeader>
                        <DialogTitle>Add tags</DialogTitle>
                        <DialogDescription>
                            Adds to {selectedCount} selected {selectedCount === 1 ? "customer" : "customers"}. Existing
                            tags are kept.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="bulk-add-tag-input">Tags</Label>
                        <Input
                            id="bulk-add-tag-input"
                            autoFocus
                            placeholder="e.g. VIP, Repeat customer"
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
                    </div>
                    {existingTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {existingTags.slice(0, 12).map((tag) => (
                                <Button key={tag} type="button" size="sm" variant="outline"
                                    className="h-7 rounded-full px-2.5 text-xs" onClick={() => addSuggestion(tag)}>
                                    {tag}
                                </Button>
                            ))}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => close(false)}>Cancel</Button>
                        <Button type="submit" disabled={tags.length === 0}>
                            Add {tags.length > 1 ? `${tags.length} tags` : "tag"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
