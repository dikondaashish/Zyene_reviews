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

/** Each group says who is in it and what to do with them, so the tabs double as a to-do list. */
const TABS: { id: SmartSegmentTab; label: string; hint: string }[] = [
    { id: "all", label: "Everyone", hint: "Every customer for this location. Select people to send them a review request." },
    { id: "never_reviewed", label: "Asked, no response", hint: "Got a request but have not acted on it yet. Select them and send a friendly reminder." },
    { id: "already_reviewed", label: "Responded", hint: "Left private feedback or clicked through to Google. Google does not tell us whether the review was posted." },
    { id: "recent", label: "Last 30 days", hint: "Added or asked in the last 30 days." },
    { id: "no_contact", label: "Missing email and phone", hint: "We cannot reach these people. Add an email or phone number to include them." },
    { id: "opted_out", label: "Opted out", hint: "Asked not to be contacted. They never receive review requests." },
];

interface CustomerSegmentTabsProps {
    value: SmartSegmentTab;
    onChange: (tab: SmartSegmentTab) => void;
    counts: SegmentCounts;
}

export function CustomerSegmentTabs({ value, onChange, counts }: CustomerSegmentTabsProps) {
    const activeHint = TABS.find((t) => t.id === value)?.hint;
    return (
        <div className="min-w-0 space-y-3 border-t border-border/50 pt-4">
        <div role="group" aria-label="Customer groups" className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-wrap md:gap-2">
            {TABS.map((t) => {
                const n = counts[t.id];
                const active = value === t.id;
                return (
                    <button
                        key={t.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(t.id)}
                        className={cn(
                            "min-w-0 rounded-full px-2.5 py-2 text-left text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-center md:shrink-0",
                            active
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <span className="block truncate">
                            {t.label} <span className="tabular-nums opacity-70">{n}</span>
                        </span>
                    </button>
                );
            })}
        </div>
        {activeHint ? <p className="text-sm leading-6 text-muted-foreground">{activeHint}</p> : null}
        </div>
    );
}
