"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getAppBaseUrl } from "@/config/env";

interface WebhookCardProps {
    apiKey?: string | null;
}

export function WebhookCard({ apiKey }: WebhookCardProps) {
    const [copied, setCopied] = useState(false);
    const apiBase = getAppBaseUrl();
    const webhookUrl = apiKey
        ? `${apiBase}/api/webhooks/generic?key=${apiKey}`
        : `${apiBase}/api/webhooks/generic?key=YOUR_API_KEY`;

    const handleCopy = () => {
        if (!apiKey) {
            toast.info("Generate an API key first in the Developer API card.");
            return;
        }
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        toast.success("Webhook URL copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                        >
                            <path d="M18 8c0 4.418-7.163 8-16 8" />
                            <path d="M2.05 16a16.6 16.6 0 0 0 5.45 2c6.945 0 13.096-2.583 14.5-6q0-.25 0-.5V8" />
                        </svg>
                    </div>
                    <div>
                        <CardTitle>Incoming Webhook</CardTitle>
                        <CardDescription>Trigger review requests from external systems</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!apiKey && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <p>
                            Generate an API key in the <span className="font-medium">Developer API</span>{" "}
                            card &mdash; the webhook URL is signed by it.
                        </p>
                    </div>
                )}
                <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={handleCopy} disabled={!apiKey}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Use this URL with Zapier, Make, or your POS to send a review request when a transaction
                    completes. POST JSON like{" "}
                    <code className="font-mono text-xs">
                        {`{ "name": "Customer Name", "email": "customer@email.com", "phone": "+15551234567", "channel": "both" }`}
                    </code>
                    .
                </p>
            </CardContent>
        </Card>
    );
}
