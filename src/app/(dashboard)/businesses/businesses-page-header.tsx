import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { BUSINESS_LIMIT_UPGRADE_BILLING_HREF } from "@/lib/billing/business-limit-upgrade-href";
import { Button } from "@/components/ui/button";

export function BusinessesPageHeader({ atLimit, organizationName }: {
    atLimit: boolean;
    organizationName?: string | null;
}) {
    return (
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0">
                <p className="mb-2 truncate text-xs font-medium text-muted-foreground">{organizationName || "Your workspace"}</p>
                <h1 className="text-3xl font-semibold tracking-tight">Businesses</h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Manage your locations, reviews, and platform connections.
                </p>
            </div>
            <Button asChild className="shrink-0 self-start rounded-lg sm:self-center">
                <Link href={atLimit ? BUSINESS_LIMIT_UPGRADE_BILLING_HREF : "/businesses/add"}>
                    {atLimit ? <ArrowUpRight className="size-4" /> : <Plus className="size-4" />}
                    {atLimit ? "Upgrade to add a business" : "Add a business"}
                </Link>
            </Button>
        </header>
    );
}
