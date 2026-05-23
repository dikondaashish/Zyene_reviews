"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { CustomerRow } from "@/components/customers/customer-detail-helpers";

export function CustomerDetailProfileTagsSince({
    customer,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
}: {
    customer: CustomerRow;
    tags: string[];
    tagInput: string;
    setTagInput: (v: string) => void;
    addTag: () => void;
    removeTag: (tag: string) => void;
}) {
    return (
        <>
            <div className="rounded-xl border border-border/80 bg-muted/15 p-4 sm:p-5">
                <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">Tags</p>
                    <p className="text-xs text-muted-foreground">Organize this contact for campaigns and filters.</p>
                </div>
                {tags.length === 0 ? (
                    <p className="mb-3 text-sm text-muted-foreground">
                        No tags yet ,  add labels to find this contact in filters.
                    </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 border border-border/60 bg-background py-1 pr-1 pl-2.5 text-xs font-medium shadow-sm"
                        >
                            {tag}
                            <button
                                type="button"
                                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label={`Remove ${tag}`}
                                onClick={() => removeTag(tag)}
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                    <div className="flex min-w-[12rem] flex-1 items-center gap-2 sm:max-w-md">
                        <Input
                            placeholder="Type a tag and press Enter"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addTag();
                                }
                            }}
                            className="h-9 flex-1 text-sm"
                        />
                        <Button type="button" size="sm" variant="secondary" className="shrink-0" onClick={addTag}>
                            <Plus className="mr-1 size-3.5" />
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="shrink-0 opacity-70 size-4" />
                <span>
                    Customer since{" "}
                    <span className="font-medium text-foreground">
                        {format(parseISO(customer.created_at), "MMMM d, yyyy")}
                    </span>
                </span>
            </div>
        </>
    );
}
