import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EngineCoveragePanel } from "./engine-coverage-panel";
import { QuotaMeterPanel } from "./quota-meter-panel";
import type { EngineCoverage } from "./load-prompts-page-data";
import type { QuotaMeterResult } from "@/services/aeo/billing/quota-meter";

export function PromptsSidebar({ engines, quotaMeter }: { engines: EngineCoverage[]; quotaMeter: QuotaMeterResult }) {
    return (
        <div className="space-y-6 lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Engine coverage</CardTitle>
                    <CardDescription>
                        Every engine we track, including those we cannot sample yet and why.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EngineCoveragePanel engines={engines} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quota &amp; cost</CardTitle>
                    <CardDescription>Projected spend at your current prompt load.</CardDescription>
                </CardHeader>
                <CardContent>
                    <QuotaMeterPanel meter={quotaMeter} />
                </CardContent>
            </Card>
        </div>
    );
}
