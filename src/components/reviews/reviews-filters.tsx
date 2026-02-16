"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, SlidersHorizontal } from "lucide-react";

export function ReviewsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all" || !value) params.delete(key);
        else params.set(key, value);

        if (key !== "page") params.delete("page");

        router.push(`/reviews?${params.toString()}`);
    };

    return (
        <div className="bg-white p-1 rounded-lg border shadow-sm flex flex-col sm:flex-row gap-2 sm:items-center justify-between sticky top-0 z-10">
            <div className="flex items-center overflow-x-auto no-scrollbar">
                <Tabs defaultValue={searchParams.get("status") || "all"} onValueChange={(val) => updateFilter("status", val)} className="w-full sm:w-auto">
                    <TabsList className="bg-transparent h-9 p-0">
                        <TabsTrigger value="all" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-gray-200 rounded-md h-8 text-xs px-3">All</TabsTrigger>
                        <TabsTrigger value="needs_response" className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-yellow-100 rounded-md h-8 text-xs px-3">Needs Response</TabsTrigger>
                        <TabsTrigger value="responded" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-green-100 rounded-md h-8 text-xs px-3">Responded</TabsTrigger>
                        <TabsTrigger value="ignored" className="data-[state=active]:bg-gray-100 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-gray-200 rounded-md h-8 text-xs px-3">Ignored</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex items-center gap-2 p-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                <Select defaultValue={searchParams.get("rating") || "all"} onValueChange={(val) => updateFilter("rating", val)}>
                    <SelectTrigger className="h-8 w-[110px] text-xs border-dashed focus:ring-0">
                        <div className="flex items-center text-muted-foreground">
                            <Filter className="w-3 h-3 mr-2" />
                            <span className="text-gray-900 truncate">{searchParams.get("rating") ? `${searchParams.get("rating")} Stars` : "Rating"}</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue={searchParams.get("sort") || "newest"} onValueChange={(val) => updateFilter("sort", val)}>
                    <SelectTrigger className="h-8 w-[130px] text-xs border-dashed focus:ring-0">
                        <div className="flex items-center text-muted-foreground">
                            <SlidersHorizontal className="w-3 h-3 mr-2" />
                            <span className="text-gray-900 truncate">Sort</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="highest">Highest Rating</SelectItem>
                        <SelectItem value="lowest">Lowest Rating</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
