"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, SlidersHorizontal } from "lucide-react";

interface ReviewsFiltersProps {
    filters: {
        status: string;
        rating: string;
        sort: string;
    };
    onFilterChange: (key: string, value: string) => void;
}

export function ReviewsFilters({ filters, onFilterChange }: ReviewsFiltersProps) {
    return (
        <div className="sticky top-0 z-20 flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card/95 p-2 backdrop-blur-sm supports-[backdrop-filter]:bg-card/90 sm:flex-row sm:items-center sm:justify-between sm:p-1">
            <div className="min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Tabs value={filters.status || "all"} onValueChange={(val) => onFilterChange("status", val)} className="w-full min-w-max sm:w-auto">
                    <TabsList className="h-9 w-full justify-start bg-transparent p-0 sm:w-auto">
                        <TabsTrigger value="all" className="h-8 shrink-0 rounded-md border border-transparent px-2.5 text-xs data-[state=active]:border-border data-[state=active]:bg-muted sm:px-3">All</TabsTrigger>
                        <TabsTrigger value="needs_response" className="h-8 shrink-0 rounded-md border border-transparent px-2.5 text-xs data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary sm:px-3">Needs reply</TabsTrigger>
                        <TabsTrigger value="responded" className="h-8 shrink-0 rounded-md border border-transparent px-2.5 text-xs data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary sm:px-3">Responded</TabsTrigger>
                        <TabsTrigger value="ignored" className="h-8 shrink-0 rounded-md border border-transparent px-2.5 text-xs data-[state=active]:border-border data-[state=active]:bg-muted sm:px-3">Ignored</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-2 border-t border-border pt-2 sm:flex sm:flex-wrap sm:items-center sm:border-t-0 sm:pt-0 min-[480px]:grid-cols-2">
                <Select value={filters.rating || "all"} onValueChange={(val) => onFilterChange("rating", val)}>
                    <SelectTrigger className="h-9 w-full text-sm border-dashed focus:ring-0 sm:w-[130px] md:h-8 md:text-xs">
                        <div className="flex items-center pointer-events-none">
                            <Filter className="mr-2 text-muted-foreground size-3" />
                            <SelectValue placeholder="Rating" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stars</SelectItem>
                        <SelectItem value="5">⭐ 5 Stars</SelectItem>
                        <SelectItem value="4">⭐ 4 Stars</SelectItem>
                        <SelectItem value="3">⭐ 3 Stars</SelectItem>
                        <SelectItem value="2">⭐ 2 Stars</SelectItem>
                        <SelectItem value="1">⭐ 1 Star</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.sort || "newest"} onValueChange={(val) => onFilterChange("sort", val)}>
                    <SelectTrigger className="h-9 w-full text-sm border-dashed focus:ring-0 sm:w-[150px] md:h-8 md:text-xs">
                        <div className="flex items-center pointer-events-none">
                            <SlidersHorizontal className="mr-2 text-muted-foreground size-3" />
                            <SelectValue placeholder="Sort" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Latest Reviews</SelectItem>
                        <SelectItem value="oldest">Oldest Reviews</SelectItem>
                        <SelectItem value="highest">Highest Rated</SelectItem>
                        <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
