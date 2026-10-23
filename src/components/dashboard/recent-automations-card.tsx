import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { RecentAutomation } from "@/lib/dashboard/recent-automations";

/** Proof that automations are working: each finished action with a green check. */
export function RecentAutomationsCard({ items }: { items: RecentAutomation[] }) {
    return (
        <section aria-labelledby="recent-automations-title" className="rounded-xl border bg-card">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                <div>
                    <h2 id="recent-automations-title" className="ui-section-title">Recent automations</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">What Zyene did for you in the last 30 days</p>
                </div>
                <Link href="/automations" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    All activity<ArrowRight className="size-3.5" aria-hidden />
                </Link>
            </header>
            {items.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground sm:px-6">
                    Nothing has run yet. When Zyene sends a review request or posts a reply, it shows up here.{" "}
                    <Link href="/automations" className="font-medium text-foreground underline underline-offset-2">Set up automations</Link>
                </p>
            ) : (
                <ul className="grid gap-px bg-border sm:grid-cols-2">
                    {items.map((item) => (
                        <li key={item.id} className="bg-card">
                            <Link href={item.href} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 sm:px-6">
                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 fill-success text-card" aria-hidden />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                                    <span className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 text-xs text-muted-foreground">
                                        <span>{item.detail}</span>
                                        <time dateTime={item.at} suppressHydrationWarning>
                                            {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
                                        </time>
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
