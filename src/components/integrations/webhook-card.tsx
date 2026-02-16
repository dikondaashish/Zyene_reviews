
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function WebhookCard({ businessId }: { businessId: string }) {
    const [copied, setCopied] = useState(false);
    const webhookUrl = `https://dashboard.zyeneratings.com/api/webhooks/generic?key=${businessId}`;

    const handleCopy = () => {
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M18 8c0 4.418-7.163 8-16 8" /><path d="M2.05 16a16.6 16.6 0 0 0 5.45 2c6.945 0 13.096-2.583 14.5-6q0-.25 0-.5V8" /></svg>
                    </div>
                    <div>
                        <CardTitle>Incoming Webhook</CardTitle>
                        <CardDescription>Trigger review requests from external systems</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Use this URL with Zapier, Make, or your POS system to automatically send review requests when a transaction completes.
                    Send a POST request with JSON body: <code>{`{ "name": "Customer Name", "email": "customer@email.com" }`}</code>
                </p>
            </CardContent>
        </Card>
    );
}
