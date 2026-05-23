"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FacebookBrandIcon } from "@/components/integrations/facebook-brand-icon";

export function FacebookIntegrationCardDisconnected({
    connecting,
    handleConnect,
}: {
    connecting: boolean;
    handleConnect: () => void;
}) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <FacebookBrandIcon className="h-5 w-5 shrink-0" aria-hidden />
                    <CardTitle className="text-base">Facebook</CardTitle>
                </div>
                <CardDescription>Track Facebook and Instagram page reviews &amp; recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="rounded-lg bg-primary/10 dark:bg-primary/15 p-3 text-xs text-primary">
                    <p className="font-medium mb-1">Facebook uses Recommendations</p>
                    <p>
                        Facebook pages use a thumbs up/down recommendation system instead of star ratings. We map
                        positive → 5★, negative → 1★.
                    </p>
                </div>
                <Button className="w-full" onClick={handleConnect} disabled={connecting}>
                    {connecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <FacebookBrandIcon className="h-4 w-4 mr-2 shrink-0" aria-hidden />
                    )}
                    Connect Facebook Page
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                    Requires Facebook App Review for production use
                </p>
            </CardContent>
        </Card>
    );
}
