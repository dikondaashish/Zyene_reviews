"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SAMPLE_PAYLOAD, ZapierExamplePayloadBlock } from "./zapier-example-payload-block";

export function ZapierWebhookUrlCard({
    appBaseUrl,
    businessId,
}: {
    appBaseUrl: string;
    businessId: string;
}) {
    const webhookUrl = `${appBaseUrl}/api/webhooks/generic`;
    const businessIdShort = `${businessId.slice(0, 8)}…${businessId.slice(-4)}`;
    const [copied, setCopied] = useState<"url" | "payload" | null>(null);

    async function copy(value: string, kind: "url" | "payload", message: string) {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(kind);
            setTimeout(() => setCopied(null), 1800);
            toast.success(message);
        } catch {
            toast.error("Could not copy to clipboard.");
        }
    }

    return (
        <Card className="overflow-hidden border-primary/20 bg-card">
            <div className="h-1 w-full bg-gradient-to-r from-sync-action to-primary" />
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b border-border/60 bg-muted/15 pb-4">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Setup</p>
                    <h2 className="text-lg font-semibold tracking-tight">Webhook endpoint</h2>
                </div>
                <Badge className="border-0 bg-primary/10 text-primary">Bearer auth</Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
                <p className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                    Use the full key shown once in the card above. If it was not saved, rotate it before configuring Zapier. You can also manage keys on the{" "}
                    <Link href="/settings/integrations#developer-api" className="font-medium text-primary hover:underline">Integrations page</Link>.
                </p>

                <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Webhook URL</label>
                    <div className="flex gap-2">
                        <Input value={webhookUrl} readOnly className="bg-muted/50 font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => copy(webhookUrl, "url", "Webhook URL copied")} aria-label="Copy webhook URL">
                            {copied === "url" ? <Check className="size-4 text-chart-2" /> : <Copy className="size-4" />}
                        </Button>
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                        This URL contains no secret. Connected to business{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono">{businessIdShort}</code>.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Header name</label>
                        <Input value="Authorization" readOnly className="bg-muted/50 font-mono text-xs" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Header value</label>
                        <Input value="Bearer YOUR_API_KEY" readOnly className="bg-muted/50 font-mono text-xs" />
                    </div>
                </div>

                <ZapierExamplePayloadBlock copied={copied === "payload"} onCopy={() => copy(SAMPLE_PAYLOAD, "payload", "Example payload copied")} />
            </CardContent>
        </Card>
    );
}
