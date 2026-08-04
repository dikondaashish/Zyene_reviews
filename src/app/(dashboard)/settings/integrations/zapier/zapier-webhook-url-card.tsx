"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, Check, Copy, KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { SAMPLE_PAYLOAD, ZapierExamplePayloadBlock } from "./zapier-example-payload-block";

interface ZapierWebhookUrlCardProps {
    appBaseUrl: string;
    apiKey: string | null;
    businessId: string;
}

export function ZapierWebhookUrlCard({
    appBaseUrl,
    apiKey,
    businessId,
}: ZapierWebhookUrlCardProps) {
    const webhookUrl = useMemo(() => {
        const key = apiKey ?? "YOUR_API_KEY";
        return `${appBaseUrl}/api/webhooks/generic?key=${key}`;
    }, [appBaseUrl, apiKey]);

    const businessIdShort = `${businessId.slice(0, 8)}…${businessId.slice(-4)}`;

    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedPayload, setCopiedPayload] = useState(false);

    const handleCopy = async (
        value: string,
        kind: "url" | "payload",
        successMessage: string,
    ) => {
        if (kind === "url" && !apiKey) {
            toast.info("Generate an API key first on the Integrations page.");
            return;
        }
        try {
            await navigator.clipboard.writeText(value);
            if (kind === "url") {
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 1800);
            } else {
                setCopiedPayload(true);
                setTimeout(() => setCopiedPayload(false), 1800);
            }
            toast.success(successMessage);
        } catch {
            toast.error("Could not copy to clipboard.");
        }
    };

    return (
        <Card className="overflow-hidden border-primary/20 bg-card">
            <div className="h-1 w-full bg-gradient-to-r from-sync-action to-primary" />
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 border-b border-border/60 bg-muted/15 pb-4">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Setup
                    </p>
                    <h2 className="text-lg font-semibold tracking-tight">
                        Your webhook URL
                    </h2>
                </div>
                <Badge
                    className={
                        apiKey
                            ? "border-0 bg-chart-2/15 text-xs text-chart-2 dark:bg-chart-2/20 dark:text-chart-2"
                            : "border-0 bg-muted text-xs text-muted-foreground"
                    }
                >
                    {apiKey ? "Ready" : "Needs API key"}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
                {!apiKey && (
                    <div className="flex items-start gap-2 rounded-md border border-chart-4/35 bg-chart-4/12 p-3 text-xs text-chart-4">
                        <AlertTriangle className="mt-0.5 shrink-0 size-3.5" aria-hidden />
                        <div className="space-y-2">
                            <p>
                                You need a Developer API key before you can use Zapier ,  the
                                webhook URL is signed by it.
                            </p>
                            <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs">
                                <Link href="/settings/integrations#developer-api" className="inline-flex items-center gap-1.5">
                                    <KeyRound className="size-3" />
                                    Generate API key
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Webhook URL
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={webhookUrl}
                            readOnly
                            className="bg-muted/50 font-mono text-xs"
                            onFocus={(e) => e.currentTarget.select()}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => handleCopy(webhookUrl, "url", "Webhook URL copied")}
                            disabled={!apiKey}
                            aria-label="Copy webhook URL"
                        >
                            {copiedUrl ? (
                                <Check className="text-chart-2 size-4" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </Button>
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Treat this URL like a password ,  it includes your API key.
                        Connected to business{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                            {businessIdShort}
                        </code>
                        .
                    </p>
                </div>

                <ZapierExamplePayloadBlock
                    copied={copiedPayload}
                    onCopy={() =>
                        handleCopy(SAMPLE_PAYLOAD, "payload", "Example payload copied")
                    }
                />
            </CardContent>
        </Card>
    );
}
