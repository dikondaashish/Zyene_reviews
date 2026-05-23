"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Customer } from "@/components/customers/customer-table-types";

export function CustomerTagsCell({
    customer,
    onSaveTags,
    tagPillClass,
    className,
}: {
    customer: Customer;
    onSaveTags: (customer: Customer, tags: string[]) => void | Promise<void>;
    tagPillClass: (tag: string) => string;
    className?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [input, setInput] = React.useState("");
    const tags = customer.tags ?? [];

    const commit = (next: string[]) => {
        void onSaveTags(customer, next);
    };

    const removeTag = (tag: string) => {
        commit(tags.filter((t) => t !== tag));
    };

    const addTag = () => {
        const t = input.trim();
        if (!t || tags.includes(t)) {
            setInput("");
            return;
        }
        commit([...tags, t]);
        setInput("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex w-full max-w-full flex-wrap items-center gap-1 rounded-md border border-transparent p-1 text-left transition-colors hover:border-border hover:bg-muted/40 sm:max-w-[220px]",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {tags.length > 0 ? (
                        tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className={cn("border px-1.5 py-0 text-[10px] font-medium", tagPillClass(tag))}
                            >
                                {tag}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs italic text-muted-foreground">Add tags…</span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-80 space-y-3"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <p className="text-xs font-medium text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className={cn("gap-1 pr-1 font-normal", tagPillClass(tag))}
                        >
                            {tag}
                            <button
                                type="button"
                                className="rounded p-0.5 hover:bg-muted"
                                aria-label={`Remove ${tag}`}
                                onClick={() => removeTag(tag)}
                            >
                                <Trash2 className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="New tag"
                        value={input}
                        className="h-8 text-sm"
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                    />
                    <Button type="button" size="icon" variant="outline" className="shrink-0 size-8" onClick={addTag}>
                        <Plus className="size-4" />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
