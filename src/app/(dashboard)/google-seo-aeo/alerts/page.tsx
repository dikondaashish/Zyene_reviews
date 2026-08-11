import { Building2 } from "lucide-react";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadAlertsPageData } from "./load-alerts-page-data";
import { AlertsList } from "./alerts-list";
import { GoogleSeoAeoSubnav } from "../google-seo-aeo-subnav";

export default async function AeoAlertsPage() {
    const data = await loadAlertsPageData();

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Building2}
                title="Add a business to see AEO alerts"
                description="Alerts are scoped to your active location. Create or select a business first."
            />
        );
    }

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden p-4 md:p-8">
            <GoogleSeoAeoSubnav active="/google-seo-aeo/alerts" />
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Alerts</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Only shown when a change clears a statistical significance bar — not every sampling wobble.
                </p>
            </div>

            {!data.liveAlertingEnabled && (
                <Alert>
                    <AlertTitle>Alerting is switched off</AlertTitle>
                    <AlertDescription>
                        Nothing new will appear here until <code>AEO_LIVE_ALERTING</code> is enabled for
                        this deployment.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Recent alerts</CardTitle>
                    <CardDescription>Last 90 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertsList alerts={data.alerts} />
                </CardContent>
            </Card>
        </div>
    );
}
