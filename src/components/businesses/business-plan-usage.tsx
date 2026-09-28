import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { BUSINESS_LIMIT_UPGRADE_BILLING_HREF } from "@/lib/billing/business-limit-upgrade-href";

export function BusinessPlanUsage({ count, limit }: { count: number; limit: number }) {
    const atLimit = count >= limit;
    return (
        <aside aria-label="Business plan usage" className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <Building2 className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                    <p className="text-sm font-medium">{count} of {limit} business {limit === 1 ? "slot" : "slots"} used</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {atLimit ? "Managing another location? Upgrade your plan to add it here." : "Add locations as your business grows. Each has its own reviews and settings."}
                    </p>
                </div>
            </div>
            <Link href={atLimit ? BUSINESS_LIMIT_UPGRADE_BILLING_HREF : "/settings/billing"}
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring sm:self-center">
                {atLimit ? "Explore plans" : "Manage plan"}<ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
        </aside>
    );
}
