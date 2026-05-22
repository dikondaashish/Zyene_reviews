"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Check, Zap, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getAppBaseUrl } from "@/config/env";

interface ZapierCardProps {
    /** Required so we can fall back to a friendly disabled state when the user hasn't generated a key yet. */
    apiKey?: string | null;
}

export function ZapierCard({ apiKey }: ZapierCardProps) {
    const [copied, setCopied] = useState(false);
    const apiBase = getAppBaseUrl();
    const webhookUrl = apiKey
        ? `${apiBase}/api/webhooks/generic?key=${apiKey}`
        : `${apiBase}/api/webhooks/generic?key=YOUR_API_KEY`;

    const handleCopy = () => {
        if (!apiKey) {
            toast.info("Generate an API key first in the Developer API card below.");
            return;
        }
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        toast.success("Webhook URL copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="overflow-hidden border-primary/20">
            <div className="h-1 bg-primary w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                            <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-base">Zapier</p>
                            <p className="text-sm text-muted-foreground">
                                Connect 5,000+ apps via Zapier
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={
                            apiKey
                                ? "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2 gap-1 border-0 text-xs"
                                : "bg-muted text-muted-foreground gap-1 border-0 text-xs"
                        }
                    >
                        {apiKey ? "Available" : "Needs API key"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
                {!apiKey && (
                    <div className="flex items-start gap-2 rounded-md border border-chart-4/35 bg-chart-4/12 p-3 text-xs text-chart-4">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <p>
                            Generate an API key in the <span className="font-medium">Developer API</span>{" "}
                            section below first &mdash; the webhook URL is signed by it.
                        </p>
                    </div>
                )}

                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Webhook URL
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={webhookUrl}
                            readOnly
                            className="font-mono text-xs bg-muted/50"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={handleCopy}
                            disabled={!apiKey}
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-chart-2" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-medium text-foreground text-sm">Quick Setup</p>
                    <p>1. In Zapier, create a new Zap with your POS as the trigger.</p>
                    <p>
                        2. Add a &quot;Webhooks by Zapier&quot; action &rarr; choose <span className="font-mono">POST</span>.
                    </p>
                    <p>3. Paste the URL above into the Webhook field.</p>
                    <p>
                        4. Send JSON with <span className="font-mono">name</span>,{" "}
                        <span className="font-mono">email</span>, and/or{" "}
                        <span className="font-mono">phone</span>. Optional:{" "}
                        <span className="font-mono">channel</span> = sms | email | both | link.
                    </p>
                </div>

                <div className="rounded-lg border bg-background/60 p-3 text-[11px] text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Example payload</p>
                    <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">{`{
  "name": "Sam Patel",
  "email": "sam@example.com",
  "phone": "+15551234567",
  "channel": "both"
}`}</pre>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-0 sm:flex-row">
                <Button asChild size="sm" className="w-full sm:flex-1">
                    <Link
                        href="/settings/integrations/zapier"
                        className="inline-flex items-center justify-center"
                    >
                        Full setup guide
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full sm:flex-1">
                    <a
                        href="https://zapier.com/apps/webhook/integrations"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center"
                    >
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Open Zapier
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}
