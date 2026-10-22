import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepFunnel, type StepFunnelStage } from "@/components/metrics/step-funnel";

/** The campaign's one results view: each step, and how many made it from the step above. */
export function CampaignDetailFunnel({ funnelStages }: { funnelStages: StepFunnelStage[] }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="ui-card-title">Results</CardTitle>
            </CardHeader>
            <CardContent>
                <StepFunnel stages={funnelStages} label="Campaign results funnel" />
            </CardContent>
        </Card>
    );
}
