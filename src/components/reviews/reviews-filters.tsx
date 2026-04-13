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
        <div className="bg-card p-1 rounded-lg border border-border flex flex-col sm:flex-row gap-2 sm:items-center justify-between sticky top-0 z-10">
            <div className="flex items-center overflow-x-auto no-scrollbar">
                <Tabs value={filters.status || "all"} onValueChange={(val) => onFilterChange("status", val)} className="w-full sm:w-auto">
                    <TabsList className="bg-transparent h-9 p-0">
                        <TabsTrigger value="all" className="data-[state=active]:bg-muted border border-transparent data-[state=active]:border-border rounded-md h-8 text-xs px-3">All</TabsTrigger>
                        <TabsTrigger value="needs_response" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md h-8 text-xs px-3">Needs Response</TabsTrigger>
                        <TabsTrigger value="responded" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-md h-8 text-xs px-3">Responded</TabsTrigger>
                        <TabsTrigger value="ignored" className="data-[state=active]:bg-muted border border-transparent data-[state=active]:border-border rounded-md h-8 text-xs px-3">Ignored</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-2 p-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                <Select value={filters.rating || "all"} onValueChange={(val) => onFilterChange("rating", val)}>
                    <SelectTrigger className="h-8 w-[130px] text-xs border-dashed focus:ring-0">
                        <div className="flex items-center pointer-events-none">
                            <Filter className="w-3 h-3 mr-2 text-muted-foreground" />
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
                    <SelectTrigger className="h-8 w-[150px] text-xs border-dashed focus:ring-0">
                        <div className="flex items-center pointer-events-none">
                            <SlidersHorizontal className="w-3 h-3 mr-2 text-muted-foreground" />
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
