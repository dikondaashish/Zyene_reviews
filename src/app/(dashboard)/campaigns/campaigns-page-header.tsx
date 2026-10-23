import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";

export function CampaignsPageHeader() {
    return (
        <PageHeader
            title="Campaigns"
            description="Each campaign asks a group of customers for a review by text or email, then follows up for you."
            actionsClassName="grid w-full grid-cols-1 min-[400px]:grid-cols-2 sm:flex sm:w-auto"
            actions={<>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link href="/campaigns?tab=templates" scroll={false} className="flex w-full items-center justify-center">
                        <LayoutGrid className="mr-2 size-4" />
                        <span className="sm:hidden">Templates</span>
                        <span className="hidden sm:inline">Browse templates</span>
                    </Link>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/campaigns/new" className="flex w-full items-center justify-center">
                        <Plus className="mr-2 size-4" />
                        Create campaign
                    </Link>
                </Button>
            </>}
        />
    );
}
