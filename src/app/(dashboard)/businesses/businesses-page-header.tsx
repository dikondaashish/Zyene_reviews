import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { BUSINESS_LIMIT_UPGRADE_BILLING_HREF } from "@/lib/billing/business-limit-upgrade-href";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";

export function BusinessesPageHeader({ atLimit, organizationName }: {
    atLimit: boolean;
    organizationName?: string | null;
}) {
    return (
        <PageHeader
            eyebrow={organizationName || "Your workspace"}
            title="Businesses"
            description="Manage your locations, reviews, and platform connections."
            actions={
                <Button asChild className="rounded-lg">
                    <Link href={atLimit ? BUSINESS_LIMIT_UPGRADE_BILLING_HREF : "/businesses/add"}>
                        {atLimit ? <ArrowUpRight className="size-4" /> : <Plus className="size-4" />}
                        {atLimit ? "Upgrade to add a business" : "Add a business"}
                    </Link>
                </Button>
            }
        />
    );
}
