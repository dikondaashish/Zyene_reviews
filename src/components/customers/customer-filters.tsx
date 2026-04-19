"use client";

import { Input } from "@/components/ui/input";
import { 
    Search, 
    Filter, 
    Tag as TagIcon, 
    Users, 
    Zap, 
    Clock, 
    Star, 
    X,
    ChevronDown
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export type CustomerSegment = "all" | "high-value" | "loyal" | "needs-request" | "recent";

interface CustomerFiltersProps {
    onSearchChange: (value: string) => void;
    onSegmentChange: (segment: CustomerSegment) => void;
    onTagChange: (tags: string[]) => void;
    availableTags: string[];
}

export function CustomerFilters({ onSearchChange, onSegmentChange, onTagChange, availableTags }: CustomerFiltersProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState("");

    const toggleTag = (tag: string) => {
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        setSelectedTags(newTags);
        onTagChange(newTags);
    };

    const clearFilters = () => {
        setSearchValue("");
        setSelectedTags([]);
        onSearchChange("");
        onTagChange([]);
        onSegmentChange("all");
    };

    return (
        <div className="mb-5 flex flex-col gap-3 p-0">
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        className="h-9 rounded-lg border-border bg-background pl-9 text-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            onSearchChange(e.target.value);
                        }}
                    />
                </div>

                {/* Segment Selector */}
                <div className="w-full md:w-[210px]">
                    <Select defaultValue="all" onValueChange={(v) => onSegmentChange(v as CustomerSegment)}>
                        <SelectTrigger className="h-9 rounded-lg border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/15">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="All Customers" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                            <SelectItem value="all" className="py-2.5">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span>All Customers</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="high-value" className="py-2.5">
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-chart-4 fill-chart-4" />
                                    <span>High Value (VIP)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="loyal" className="py-2.5">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-sync-action fill-sync-action" />
                                    <span>Loyal Customers</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="needs-request" className="py-2.5">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span>Needs Request</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="recent" className="py-2.5">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-chart-2" />
                                    <span>Recent (30 Days)</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {(searchValue || selectedTags.length > 0) && (
                    <Button 
                        variant="ghost" 
                        onClick={clearFilters}
                        className="h-9 rounded-lg px-3 text-muted-foreground transition-all hover:bg-destructive/10/50 hover:text-destructive"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Tag Quick Selection */}
            {availableTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 px-0">
                    <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Quick Tags:</span>
                    {availableTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                                selectedTags.includes(tag)
                                    ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                                    : "bg-muted text-muted-foreground hover:bg-border"
                            }`}
                        >
                            <TagIcon className={`h-3 w-3 ${selectedTags.includes(tag) ? "text-primary-foreground/80" : "text-muted-foreground"}`} />
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
