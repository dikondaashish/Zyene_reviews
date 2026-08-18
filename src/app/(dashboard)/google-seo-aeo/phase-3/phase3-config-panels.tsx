import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_AEO_REPORT_COLOR } from "@/services/aeo/reporting/report-colors";
import { checkSenderDomain, createPhase3Webhook, saveBigQuery, saveWhiteLabel } from "./phase3-actions";

type Branding = { name: string; logo_url: string | null; primary_color: string; hide_powered_by: boolean;
    aeo_sender_domain: string | null; aeo_sender_domain_status: string } | null;

export function Phase3ConfigPanels({ branding, webhookCount, bigQueryCount }: {
    branding: Branding; webhookCount: number; bigQueryCount: number;
}) {
    return <section className="space-y-4" aria-labelledby="phase3-config">
        <div><h2 id="phase3-config" className="text-xl font-semibold">Agency delivery</h2>
            <p className="text-sm text-muted-foreground">Tenant-scoped branding, signed events, and structured warehouse export.</p></div>
        <div className="grid gap-4 xl:grid-cols-3">
            <Card><CardHeader><CardTitle className="text-base">White-label reports</CardTitle></CardHeader>
                <CardContent className="space-y-3"><form action={saveWhiteLabel} className="grid gap-2">
                    <Input name="name" required defaultValue={branding?.name ?? ""} placeholder="Agency name" />
                    <Input name="logoUrl" type="url" defaultValue={branding?.logo_url ?? ""} placeholder="https://.../logo.png" />
                    <label className="flex items-center gap-2 text-sm">Color <Input className="w-24" name="color" type="color" defaultValue={branding?.primary_color ?? DEFAULT_AEO_REPORT_COLOR} /></label>
                    <Input name="senderDomain" defaultValue={branding?.aeo_sender_domain ?? ""} placeholder="reports.example.com" />
                    <label className="flex items-center gap-2 text-sm"><input name="hidePoweredBy" type="checkbox" defaultChecked={branding?.hide_powered_by} /> Remove powered by</label>
                    <Button type="submit">Save branding</Button>
                </form><form action={checkSenderDomain}><Button type="submit" variant="outline" className="w-full">Verify sender domain</Button></form>
                <p className="text-xs text-muted-foreground">Sender: {branding?.aeo_sender_domain_status ?? "not configured"}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Outbound webhooks</CardTitle></CardHeader>
                <CardContent className="space-y-3"><form action={createPhase3Webhook} className="grid gap-2">
                    <Input name="name" required placeholder="Automation webhook" /><Input name="endpoint" type="url" required placeholder="https://..." />
                    <Input name="secret" type="password" required minLength={32} placeholder="Signing secret, 32+ characters" />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="events" value="aeo.alert.created" defaultChecked /> Alert created</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="events" value="aeo.run.completed" defaultChecked /> Run completed</label>
                    <Button type="submit">Add webhook</Button>
                </form><p className="text-xs text-muted-foreground">{webhookCount} configured endpoint{webhookCount === 1 ? "" : "s"}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">BigQuery export</CardTitle></CardHeader>
                <CardContent className="space-y-3"><form action={saveBigQuery} className="grid gap-2">
                    <Input name="projectId" required placeholder="Google Cloud project" /><Input name="datasetId" required placeholder="Dataset" />
                    <Input name="tableId" required placeholder="Table" /><Textarea name="credentials" required rows={5} placeholder="Service account JSON" />
                    <Button type="submit">Connect BigQuery</Button>
                </form><p className="text-xs text-muted-foreground">{bigQueryCount ? "Structured export connected" : "No warehouse connected"}</p></CardContent></Card>
        </div>
    </section>;
}
