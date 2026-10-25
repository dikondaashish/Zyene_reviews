import Link from "next/link";
import { Link2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequestsView } from "./load-requests-page-stats";

/**
 * Requests sent to a customer and visits to the public review link / QR code are kept apart:
 * a visit was never sent, so mixing them would inflate every sent-based rate.
 */
export function RequestsViewTabs({
    view,
    sentCount,
    visitCount,
}: {
    view: RequestsView;
    sentCount: number;
    visitCount: number;
}) {
    const tabs = [
        { key: "sent", href: "/requests", label: "Sent requests", count: sentCount, icon: Send },
        { key: "link", href: "/requests?view=link", label: "Public link visits", count: visitCount, icon: Link2 },
    ] as const;

    return (
        <nav aria-label="Request type" className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
                const current = tab.key === view;
                return (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                            current
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <tab.icon className="size-3.5" aria-hidden="true" />
                        {tab.label}
                        <span className="tabular-nums text-xs opacity-80">{tab.count}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
