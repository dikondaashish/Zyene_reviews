"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ClipboardCheck, Link2Off, MessageSquareWarning, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WaitingTask, WaitingTaskKind } from "@/lib/dashboard/waiting-tasks";

const ICONS: Record<WaitingTaskKind, LucideIcon> = {
    approvals: ClipboardCheck,
    "low-ratings": MessageSquareWarning,
    "broken-links": Link2Off,
    setup: Rocket,
};

const COLLAPSED_KEY = "dashboard-waiting-collapsed";

const subscribe = (onChange: () => void) => {
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
};
const readCollapsed = () => {
    try { return localStorage.getItem(COLLAPSED_KEY) === "true"; } catch { return false; }
};
/** Expanded during server render: the list is the point of the card. */
const serverCollapsed = () => false;

/** The dashboard's first answer to "is anything waiting on me?" Owners can fold it to just the header. */
export function WaitingOnYouCard({ tasks, userName }: { tasks: WaitingTask[]; userName: string }) {
    const storedCollapsed = useSyncExternalStore(subscribe, readCollapsed, serverCollapsed);
    const [collapsedNow, setCollapsedNow] = useState<boolean | null>(null);
    const collapsed = collapsedNow ?? storedCollapsed;

    if (tasks.length === 0) {
        return (
            <section aria-label="Your tasks" className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
                <CheckCircle2 className="size-4 shrink-0 fill-success text-card" aria-hidden />
                <p className="text-sm text-foreground">
                    <span className="font-medium">You&rsquo;re all caught up.</span>{" "}
                    <span className="text-muted-foreground">Nothing needs you right now. We&rsquo;ll show it here when something does.</span>
                </p>
            </section>
        );
    }

    const toggle = () => {
        const next = !collapsed;
        setCollapsedNow(next);
        try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch { /* private mode: remember for this visit only */ }
    };
    const first = tasks[0];
    return (
        <section aria-labelledby="waiting-on-you-title" className="overflow-hidden rounded-xl border bg-card">
            <header className="flex items-center gap-3 bg-primary px-4 py-2.5 text-primary-foreground sm:px-5">
                <div className="min-w-0 flex-1">
                    <h2 id="waiting-on-you-title" className="ui-section-title">
                        <button
                            type="button"
                            onClick={toggle}
                            aria-expanded={!collapsed}
                            aria-controls="waiting-on-you-list"
                            className="flex max-w-full items-center gap-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70"
                        >
                            <ChevronDown className={cn("size-4 shrink-0 transition-transform", collapsed && "-rotate-90")} aria-hidden />
                            <span className="truncate">
                                {tasks.length === 1 ? "One thing is waiting for you" : `${tasks.length} things are waiting for you`}
                            </span>
                        </button>
                    </h2>
                    <p className="truncate pl-5.5 text-xs opacity-90">
                        {collapsed ? `Hey ${userName}, open the list to see them` : `Hey ${userName}`}
                    </p>
                </div>
                <Button asChild size="xs" variant="secondary" className="shrink-0 bg-card text-foreground hover:bg-card/90">
                    <Link href={first.href}>Start here</Link>
                </Button>
            </header>
            {!collapsed && (
                <ul id="waiting-on-you-list" className="divide-y divide-border">
                    {tasks.map((task) => {
                        const Icon = ICONS[task.kind];
                        return (
                            <li key={task.kind} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-2.5 sm:px-5">
                                <span className="grid size-7 place-items-center rounded-md bg-muted text-foreground" aria-hidden>
                                    <Icon className="size-3.5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                                    <p className="truncate text-xs text-muted-foreground">{task.detail}</p>
                                </div>
                                <Button asChild size="xs" variant="outline">
                                    <Link href={task.href}>{task.cta}</Link>
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
