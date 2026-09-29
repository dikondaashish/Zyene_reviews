import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageEmptyState } from "@/components/dashboard/page-empty-state";

export function CampaignsEmptyState() {
    return (
        <PageEmptyState icon={Megaphone} title="Create your first campaign"
            description="Choose your audience, write a message, and schedule review requests. You can review everything before sending.">
            <Button asChild className="min-h-11 w-full sm:w-auto"><Link href="/campaigns/new"><Plus aria-hidden="true" className="size-4" />Create a campaign</Link></Button>
            <Button variant="outline" asChild className="min-h-11 w-full sm:w-auto"><Link href="/campaigns?tab=templates">Browse templates</Link></Button>
        </PageEmptyState>
    );
}
