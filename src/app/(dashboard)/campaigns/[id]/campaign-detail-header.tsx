import { ArrowLeft, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "./campaign-detail-types";
import { CampaignDetailAddContactsDialog } from "./campaign-detail-add-contacts-dialog";
import type { CampaignDetailState } from "./use-campaign-detail";

interface CampaignDetailHeaderProps {
    campaign: Campaign;
    detail: CampaignDetailState;
}

export function CampaignDetailHeader({ campaign, detail }: CampaignDetailHeaderProps) {
    const { router, mounted, toggleStatus } = detail;

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl">{campaign.name}</h1>
                        <Badge
                            variant={campaign.status === "active" ? "default" : "secondary"}
                            className={
                                campaign.status === "active"
                                    ? "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2"
                                    : campaign.status === "paused"
                                        ? "bg-chart-4/15 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4"
                                        : ""
                            }
                        >
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {campaign.channel === "both" ? "SMS + Email" : campaign.channel.toUpperCase()} · {campaign.trigger_type.replace("_", " ")} · Created {mounted ? new Date(campaign.created_at).toLocaleDateString() : "-"}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="flex-1 sm:flex-initial" onClick={toggleStatus}>
                    {campaign.status === "active" ? (
                        <><Pause className="mr-2 size-4" />Pause</>
                    ) : (
                        <><Play className="mr-2 size-4" />Activate</>
                    )}
                </Button>
                <CampaignDetailAddContactsDialog campaign={campaign} detail={detail} />
            </div>
        </div>
    );
}
