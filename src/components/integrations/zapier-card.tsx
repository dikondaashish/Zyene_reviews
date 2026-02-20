"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check, Zap, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function ZapierCard({ businessId }: { businessId: string }) {
    const [copied, setCopied] = useState(false);
    const webhookUrl = `https://dashboard.zyene.in/api/webhooks/generic?key=${businessId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        toast.success("Webhook URL copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="overflow-hidden border-orange-200/50 dark:border-orange-900/30">
            <div className="h-1 bg-orange-500 w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30 border shadow-sm">
                            <Zap className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-base">Zapier</p>
                            <p className="text-sm text-muted-foreground">
                                Connect 5,000+ apps via Zapier
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 gap-1 border-0 text-xs">
                        Available
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
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
                        <Button variant="outline" size="icon" className="shrink-0" onClick={handleCopy}>
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-medium text-foreground text-sm">Quick Setup</p>
                    <p>
                        1. In Zapier, create a new Zap with your POS as the trigger.
                    </p>
                    <p>
                        2. Add a &quot;Webhooks by Zapier&quot; action → choose POST.
                    </p>
                    <p>
                        3. Paste the webhook URL above and send customer data as JSON.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <a
                    href="https://zapier.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                >
                    <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Open Zapier
                    </Button>
                </a>
            </CardFooter>
        </Card>
    );
}
