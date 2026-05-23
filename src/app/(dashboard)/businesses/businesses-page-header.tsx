import Link from "next/link";
import { BUSINESS_LIMIT_UPGRADE_BILLING_HREF } from "@/lib/billing/business-limit-upgrade-href";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Lock } from "lucide-react";

export function BusinessesPageHeader({ atLimit }: { atLimit: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Businesses</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage your business locations and integrations.
                </p>
            </div>
            <Link href={atLimit ? BUSINESS_LIMIT_UPGRADE_BILLING_HREF : "/businesses/add"}>
                <Button className="gap-2" variant={atLimit ? "outline" : "default"}>
                    {atLimit ? <Lock className="size-4" /> : <Plus className="size-4" />}
                    Add a business
                    {atLimit && (
                        <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary border-primary/20">
                            Upgrade
                        </Badge>
                    )}
                </Button>
            </Link>
        </div>
    );
}
