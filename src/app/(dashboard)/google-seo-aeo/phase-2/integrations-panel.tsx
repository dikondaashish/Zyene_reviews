import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Phase2OperationsData } from "./phase2-types";
import { SecretCreator } from "./secret-creator";
import { createAlertChannel } from "./integration-actions";
import { RevokeKeyButton } from "./revoke-key-button";

export function IntegrationsPanel({ data, businessId }: { data: Phase2OperationsData; businessId: string }) {
    return (
        <section className="space-y-4" aria-labelledby="integrations-heading">
            <div><h2 id="integrations-heading" className="text-xl font-semibold">Enterprise integrations</h2><p className="text-sm text-muted-foreground">Scoped API access, crawler log ingestion, and encrypted Slack or webhook delivery.</p></div>
            <div className="grid gap-4 xl:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-base">Data access</CardTitle></CardHeader><CardContent className="space-y-4">
                    <SecretCreator businessId={businessId} kind="api" />
                    <SecretCreator businessId={businessId} kind="logs" />
                    {data.apiKeys.map((row) => <div key={row.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{row.name} · {row.prefix}… · {row.revokedAt ? "revoked" : row.lastUsedAt ? `used ${new Date(row.lastUsedAt).toLocaleDateString()}` : "never used"}</span>{!row.revokedAt ? <RevokeKeyButton keyId={row.id} /> : null}</div>)}
                    {data.logSources.map((row) => <p key={row.id} className="text-xs text-muted-foreground">{row.name} · {row.source} · {row.prefix}… · {row.lastReceivedAt ? `received ${new Date(row.lastReceivedAt).toLocaleDateString()}` : "waiting for logs"}</p>)}
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Alert channels</CardTitle></CardHeader><CardContent className="space-y-4">
                    <form action={createAlertChannel} className="grid gap-2"><div className="flex gap-2"><Input name="name" required minLength={2} placeholder="Marketing alerts" /><select name="type" className="h-9 rounded-md border bg-background px-3 text-sm"><option value="slack">Slack</option><option value="webhook">Webhook</option></select></div><Input name="endpoint" type="url" required placeholder="https://hooks.slack.com/services/..." /><Input name="signingSecret" type="password" placeholder="Signing secret for generic webhooks" /><Button type="submit">Add channel</Button></form>
                    {data.channels.length ? <div className="divide-y">{data.channels.map((row) => <div key={row.id} className="flex justify-between py-2 text-sm"><span>{row.name} · {row.type}</span><span className="text-muted-foreground">{row.deliveryStatus ?? "not delivered"}</span></div>)}</div> : <p className="text-sm text-muted-foreground">No Slack or webhook channel configured.</p>}
                </CardContent></Card>
            </div>
        </section>
    );
}
