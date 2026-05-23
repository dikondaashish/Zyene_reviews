"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { YelpCardIcon } from "./yelp-card-icon";

interface YelpIntegrationCardErrorProps {
    onReconnect: () => void;
}

export function YelpIntegrationCardError({ onReconnect }: YelpIntegrationCardErrorProps) {
    return (
        <Card className="border border-destructive/30 bg-destructive/10/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <YelpCardIcon className="h-6 w-6 text-destructive" />
                        <div>
                            <h3 className="font-semibold text-sm">Yelp</h3>
                            <p className="text-xs text-muted-foreground">Business reviews</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive text-[10px]">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Error
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <p className="text-xs text-destructive">
                    There was an error syncing your Yelp reviews. This may be due to API rate limits or an invalid Yelp
                    API key.
                </p>
            </CardContent>
            <CardFooter className="pt-0">
                <Button size="sm" variant="destructive" className="h-8 text-xs w-full" onClick={onReconnect}>
                    Reconnect
                </Button>
            </CardFooter>
        </Card>
    );
}
