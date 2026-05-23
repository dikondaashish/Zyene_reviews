"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { GoogleCardGoogleIcon } from "@/components/integrations/google-card-google-icon";

export function GoogleIntegrationCardDisconnected({ onConnect }: { onConnect: () => void }) {
    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-muted w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg bg-card border border-border size-10">
                        <GoogleCardGoogleIcon />
                    </div>
                    <div>
                        <p className="font-semibold text-base">Google Business Profile</p>
                        <p className="text-sm text-muted-foreground">Sync your Google reviews and reply from Zyene</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground">
                    Connect your Google Business Profile to automatically import reviews, track ratings, and respond —
                    all from your Zyene dashboard.
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={onConnect}>
                    <GoogleCardGoogleIcon />
                    <span className="ml-2">Connect Google Business Profile</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
