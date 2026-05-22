"use client";

import { cn } from "@/lib/utils";

export type SmartSegmentTab =
    | "all"
    | "never_reviewed"
    | "already_reviewed"
    | "recent"
    | "no_contact"
    | "opted_out";

export type SegmentCounts = {
    all: number;
    never_reviewed: number;
    already_reviewed: number;
    recent: number;
    no_contact: number;
    opted_out: number;
};

const TABS: { id: SmartSegmentTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "never_reviewed", label: "Never Reviewed" },
    { id: "already_reviewed", label: "Already Reviewed" },
    { id: "recent", label: "Recent" },
    { id: "no_contact", label: "No Contact Info" },
    { id: "opted_out", label: "Opted Out" },
];

interface CustomerSegmentTabsProps {
    value: SmartSegmentTab;
    onChange: (tab: SmartSegmentTab) => void;
    counts: SegmentCounts;
}

export function CustomerSegmentTabs({ value, onChange, counts }: CustomerSegmentTabsProps) {
    return (
        <div className="grid min-w-0 grid-cols-2 gap-2 border-t border-border/50 pt-4 sm:grid-cols-3 md:flex md:flex-wrap md:gap-2">
            {TABS.map((t) => {
                const n = counts[t.id];
                const active = value === t.id;
                return (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => onChange(t.id)}
                        className={cn(
                            "min-w-0 rounded-full px-2.5 py-2 text-left text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-center md:shrink-0",
                            active
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <span className="block truncate">
                            {t.label} ({n})
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
