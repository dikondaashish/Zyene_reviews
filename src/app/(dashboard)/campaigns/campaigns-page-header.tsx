import Link from "next/link";
import { LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CampaignsPageHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Campaigns</h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                    Create and manage automated review request campaigns
                </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link href="/campaigns/templates" className="flex w-full items-center justify-center">
                        <LayoutGrid className="mr-2 size-4" />
                        <span className="sm:hidden">Templates</span>
                        <span className="hidden sm:inline">Browse Templates</span>
                    </Link>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/campaigns/new" className="flex w-full items-center justify-center">
                        <Plus className="mr-2 size-4" />
                        Create Campaign
                    </Link>
                </Button>
            </div>
        </div>
    );
}
