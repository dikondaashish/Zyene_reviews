import { Building2, RefreshCw } from "lucide-react";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSeoAeoSubnav } from "../google-seo-aeo-subnav";
import { loadPhase3PageData } from "./load-phase3-page-data";
import { runPhase3Refresh } from "./phase3-actions";
import { Phase3ConfigPanels } from "./phase3-config-panels";

type Llms = { present: boolean; valid: boolean } | null;
type Anomaly = { eligible: boolean; anomalous: boolean; history_days: number } | null;

export async function Phase3Page() {
    const data = await loadPhase3PageData();
    if (data.kind === "no-business") return <BusinessContextEmptyState icon={Building2} title="Add a business for differentiation" description="Phase 3 measurements are scoped to the active business and organization." />;
    const llms = data.llmsTxt as Llms;
    const anomaly = data.anomaly as Anomaly;
    const signals = [
        ["Copilot", data.copilotConfigured ? "Connected preview" : "Awaiting delegated Microsoft connection"],
        ["Answer volatility", `${data.volatility.length} measured prompt-engine pairs`],
        ["Citation traffic", `${data.correlations.length} page correlations`],
        ["Competitor pages", `${data.competitorChanges.length} recorded changes`],
        ["Prompt demand", `${data.demand.length} demand estimates`],
        ["llms.txt", !llms ? "Not checked" : llms.present ? (llms.valid ? "Present and valid" : "Present with issues") : "Not present"],
        ["NAP directories", `${data.nap.length} connected profiles checked`],
        ["Anomaly baseline", !anomaly ? "Not evaluated" : anomaly.eligible ? (anomaly.anomalous ? "Anomaly detected" : "No anomaly") : `${anomaly.history_days}/90 history days`],
    ];
    return <div className="min-w-0 space-y-8 overflow-x-hidden p-4 md:p-8">
        <GoogleSeoAeoSubnav active="/google-seo-aeo/phase-3" />
        <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">Differentiation</h1>
            <p className="mt-1 text-sm text-muted-foreground">Advanced measurement and agency delivery for {data.businessName}.</p></div>
            <form action={runPhase3Refresh}><Button type="submit"><RefreshCw className="mr-2 size-4" />Refresh Phase 3</Button></form></header>
        <section className="space-y-4" aria-labelledby="phase3-signals"><div><h2 id="phase3-signals" className="text-xl font-semibold">Operational signals</h2>
            <p className="text-sm text-muted-foreground">Measured results retain explicit unavailable and insufficient-history states.</p></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{signals.map(([label, value]) => <Card key={label}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{value}</CardContent></Card>)}</div></section>
        <Phase3ConfigPanels branding={data.branding} webhookCount={data.webhooks.length} bigQueryCount={data.bigquery.length} />
    </div>;
}
