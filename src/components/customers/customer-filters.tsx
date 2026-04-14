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
        <div className="flex flex-col gap-6 p-1 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        className="pl-11 h-12 bg-background border-border rounded-2xl focus:ring-2 focus:ring-primary/15 focus:border-primary/60 transition-all text-sm font-medium"
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            onSearchChange(e.target.value);
                        }}
                    />
                </div>

                {/* Segment Selector */}
                <div className="w-full md:w-[220px]">
                    <Select defaultValue="all" onValueChange={(v) => onSegmentChange(v as CustomerSegment)}>
                        <SelectTrigger className="h-12 bg-background border-border rounded-2xl focus:ring-2 focus:ring-primary/15 text-sm font-medium px-4">
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
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    <span>High Value (VIP)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="loyal" className="py-2.5">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-purple-500 fill-purple-500" />
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
                                    <Clock className="h-4 w-4 text-green-500" />
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
                        className="h-12 px-4 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Tag Quick Selection */}
            {availableTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 px-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Quick Tags:</span>
                    {availableTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
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
