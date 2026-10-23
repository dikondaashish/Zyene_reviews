import Link from "next/link";
import { CheckCircle2, ClipboardCheck, Link2Off, MessageSquareWarning, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WaitingTask, WaitingTaskKind } from "@/lib/dashboard/waiting-tasks";

const ICONS: Record<WaitingTaskKind, LucideIcon> = {
    approvals: ClipboardCheck,
    "low-ratings": MessageSquareWarning,
    "broken-links": Link2Off,
    setup: Rocket,
};

/** The dashboard's first answer to "is anything waiting on me?" */
export function WaitingOnYouCard({ tasks, userName }: { tasks: WaitingTask[]; userName: string }) {
    if (tasks.length === 0) {
        return (
            <section aria-label="Your tasks" className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-5 py-4">
                <CheckCircle2 className="size-5 shrink-0 fill-success text-card" aria-hidden />
                <p className="text-sm text-foreground">
                    <span className="font-medium">You&rsquo;re all caught up.</span>{" "}
                    <span className="text-muted-foreground">Nothing needs you right now. We&rsquo;ll show it here when something does.</span>
                </p>
            </section>
        );
    }
    const first = tasks[0];
    return (
        <section aria-labelledby="waiting-on-you-title" className="overflow-hidden rounded-xl border bg-card">
            <header className="flex flex-col gap-3 bg-primary px-5 py-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <p className="text-xs font-medium opacity-90">Hey {userName}</p>
                    <h2 id="waiting-on-you-title" className="ui-section-title mt-0.5">
                        {tasks.length === 1 ? "One thing is waiting for you" : `${tasks.length} things are waiting for you`}
                    </h2>
                </div>
                <Button asChild size="sm" variant="secondary" className="shrink-0 bg-card text-foreground hover:bg-card/90">
                    <Link href={first.href}>{first.cta}: {first.kind === "setup" ? "next step" : "start here"}</Link>
                </Button>
            </header>
            <ul className="divide-y divide-border">
                {tasks.map((task) => {
                    const Icon = ICONS[task.kind];
                    return (
                        <li key={task.kind} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 px-5 py-3.5 sm:px-6">
                            <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground" aria-hidden>
                                <Icon className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{task.title}</p>
                                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{task.detail}</p>
                            </div>
                            <Button asChild size="sm" variant="outline">
                                <Link href={task.href}>{task.cta}</Link>
                            </Button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
