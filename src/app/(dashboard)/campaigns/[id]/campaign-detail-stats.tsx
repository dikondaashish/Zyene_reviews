import { Card, CardContent } from "@/components/ui/card";
import type { FunnelStage } from "./campaign-detail-types";

interface CampaignDetailStatsProps {
    funnelStages: FunnelStage[];
}

export function CampaignDetailStats({ funnelStages }: CampaignDetailStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {funnelStages.map((stage) => (
                <Card key={stage.label}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-lg p-2 ${stage.color} text-primary-foreground`}>
                                <stage.icon className="size-4" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stage.value}</p>
                                <p className="text-xs text-muted-foreground">{stage.label}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
