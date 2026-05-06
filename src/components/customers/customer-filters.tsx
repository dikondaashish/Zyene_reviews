"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ALL_TAGS_VALUE = "__zyene_filter_all__";

interface CustomerFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    tagFilter: string;
    onTagFilterChange: (value: string) => void;
    allTags: string[];
}

export function CustomerFilters({
    searchQuery,
    onSearchChange,
    tagFilter,
    onTagFilterChange,
    allTags,
}: CustomerFiltersProps) {
    const clearFilters = () => {
        onSearchChange("");
        onTagFilterChange("");
    };

    const hasFilters = Boolean(searchQuery || tagFilter);

    return (
        <div className="mb-0 flex flex-col gap-3 p-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        className="h-9 rounded-lg border-border bg-background pl-9 text-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                        value={searchQuery}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                        }}
                    />
                </div>

                <div className="flex w-full flex-col gap-1.5 lg:w-auto lg:min-w-[200px]">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:sr-only">
                        Filter by tag
                    </span>
                    <Select
                        value={tagFilter ? tagFilter : ALL_TAGS_VALUE}
                        onValueChange={(v) => onTagFilterChange(v === ALL_TAGS_VALUE ? "" : v)}
                    >
                        <SelectTrigger
                            size="sm"
                            className="h-9 w-full rounded-lg border-border lg:w-[220px]"
                            aria-label="Filter by tag"
                        >
                            <SelectValue placeholder="Filter by tag" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_TAGS_VALUE}>All tags</SelectItem>
                            {allTags.map((tag) => (
                                <SelectItem key={tag} value={tag}>
                                    {tag}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="h-9 shrink-0 rounded-lg px-3 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
