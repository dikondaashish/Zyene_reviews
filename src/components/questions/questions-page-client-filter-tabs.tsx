"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function QuestionsPageClientFilterTabs({
    filter,
    onFilterChange,
}: {
    filter: "all" | "unanswered";
    onFilterChange: (value: "all" | "unanswered") => void;
}) {
    return (
        <Tabs value={filter} onValueChange={(v) => onFilterChange(v as "all" | "unanswered")}>
            <TabsList variant="line" className="w-full min-w-0 justify-start overflow-x-auto border-b border-border">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
