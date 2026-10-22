"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function QuestionsPageClientFilterTabs({
    filter,
    onFilterChange,
    totalCount,
    unansweredCount,
}: {
    filter: "all" | "unanswered";
    totalCount: number;
    unansweredCount: number;
    onFilterChange: (value: "all" | "unanswered") => void;
}) {
    return (
        <Tabs value={filter} onValueChange={(v) => onFilterChange(v as "all" | "unanswered")}>
            <TabsList variant="line" className="w-full min-w-0 justify-start overflow-x-auto border-b border-border">
                <TabsTrigger value="all">All <span className="ml-1.5 tabular-nums text-muted-foreground">{totalCount}</span></TabsTrigger>
                <TabsTrigger value="unanswered">
                    Unanswered
                    <span
                        className={unansweredCount > 0 ? "ml-1.5 rounded-full bg-warning/20 px-1.5 text-xs font-semibold tabular-nums text-warning-foreground" : "ml-1.5 tabular-nums text-muted-foreground"}
                    >
                        {unansweredCount}
                    </span>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
