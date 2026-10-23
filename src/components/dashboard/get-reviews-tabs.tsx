import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Sending requests, running campaigns and the automations behind them are one job for an
 * owner: getting reviews. The sidebar shows them as one item; these tabs move between them.
 */
const TABS = [
    { href: "/campaigns", label: "Campaigns", hint: "Ask a group of customers" },
    { href: "/requests", label: "Requests", hint: "Everyone you've asked" },
    { href: "/automations", label: "Automations", hint: "What runs on its own" },
] as const;

export type GetReviewsTab = (typeof TABS)[number]["href"];

export const GET_REVIEWS_URLS: string[] = TABS.map((tab) => tab.href);

export function GetReviewsTabs({ active }: { active: GetReviewsTab }) {
    return (
        <nav aria-label="Get reviews" className="min-w-0 overflow-x-auto border-b border-border">
            <ul className="flex min-w-max gap-1">
                {TABS.map((tab) => {
                    const current = tab.href === active;
                    return (
                        <li key={tab.href}>
                            <Link
                                href={tab.href}
                                aria-current={current ? "page" : undefined}
                                title={tab.hint}
                                className={cn(
                                    "-mb-px inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                                    current
                                        ? "border-primary text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {tab.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
