"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownWideNarrow, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewsFiltersProps {
    filters: { status: string; rating: string; sort: string; q?: string };
    onFilterChange: (key: string, value: string) => void;
}

export function ReviewsFilters({ filters, onFilterChange }: ReviewsFiltersProps) {
    return (
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div role="group" aria-label="Response status" className="grid grid-cols-2 gap-1 rounded-lg bg-muted/60 p-1 min-[380px]:flex">
                {[
                    ["all", "All"], ["needs_response", "Needs reply"], ["responded", "Responded"], ["ignored", "Ignored"],
                ].map(([value, label]) => (
                    <button key={value} type="button" aria-pressed={(filters.status || "all") === value} onClick={() => onFilterChange("status", value)}
                        className={cn("min-h-9 flex-1 whitespace-nowrap rounded-md px-2 text-xs sm:px-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring sm:flex-none",
                            (filters.status || "all") === value ? "bg-card text-foreground shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:text-foreground")}>
                        {label}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
                <Select value={filters.rating || "all"} onValueChange={(val) => onFilterChange("rating", val)}>
                    <SelectTrigger aria-label="Filter by rating" className="h-10 w-full bg-card text-xs sm:w-36">
                        <Star className="hidden size-3.5 shrink-0 text-muted-foreground min-[400px]:block" aria-hidden="true" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All ratings</SelectItem>
                        {[5, 4, 3, 2, 1].map((rating) => <SelectItem key={rating} value={String(rating)}>{rating} {rating === 1 ? "star" : "stars"}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filters.sort || "newest"} onValueChange={(val) => onFilterChange("sort", val)}>
                    <SelectTrigger aria-label="Sort reviews" className="h-10 w-full bg-card text-xs sm:w-40">
                        <ArrowDownWideNarrow className="hidden size-3.5 shrink-0 text-muted-foreground min-[400px]:block" aria-hidden="true" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                        <SelectItem value="highest">Highest rated</SelectItem>
                        <SelectItem value="lowest">Lowest rated</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
