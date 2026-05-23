import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelStage } from "./campaign-detail-types";

interface CampaignDetailFunnelProps {
    funnelStages: FunnelStage[];
    maxFunnel: number;
}

export function CampaignDetailFunnel({ funnelStages, maxFunnel }: CampaignDetailFunnelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {funnelStages.map((stage) => {
                        const pct = maxFunnel > 0 ? (stage.value / maxFunnel) * 100 : 0;
                        return (
                            <div key={stage.label} className="flex items-center gap-3">
                                <span className="text-sm font-medium w-20 text-right">{stage.label}</span>
                                <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${stage.color} rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                                        style={{ width: `${Math.max(pct, 2)}%` }}
                                    >
                                        {pct >= 10 && (
                                            <span className="text-xs font-semibold text-primary-foreground">{stage.value}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm text-muted-foreground w-12">{Math.round(pct)}%</span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
