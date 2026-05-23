"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { GoogleCardGoogleIcon } from "@/components/integrations/google-card-google-icon";

export function GoogleIntegrationCardErrorState({ onReconnect }: { onReconnect: () => void }) {
    return (
        <Card className="border-destructive/30 dark:border-destructive/30 overflow-hidden">
            <div className="h-1 bg-destructive/100 w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg bg-card border border-border size-10">
                            <GoogleCardGoogleIcon />
                        </div>
                        <div>
                            <p className="font-semibold text-base">Google Business Profile</p>
                            <p className="text-sm text-muted-foreground">Sync reviews and respond directly</p>
                        </div>
                    </div>
                    <Badge variant="destructive" className="gap-1.5">
                        <AlertTriangle className="size-3" />
                        Connection Error
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/30 p-3">
                    <p className="text-sm text-destructive dark:text-destructive">
                        Your Google connection encountered an error. This usually happens when permissions expire.
                        Please reconnect to resume syncing.
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={onReconnect}>
                    <RefreshCw className="mr-2 size-4" />
                    Reconnect Google Account
                </Button>
            </CardFooter>
        </Card>
    );
}
