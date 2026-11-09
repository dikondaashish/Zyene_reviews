"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BrandLogoTile } from "@/components/integrations/brand-logo-tile";
import { CloverCardConnected } from "@/components/integrations/clover-card-connected";

const CLOVER_ERROR_MESSAGES: Record<string, string> = {
    denied: "Clover authorization was denied.",
    missing_params: "Clover returned incomplete OAuth parameters.",
    invalid_state: "Clover OAuth state was invalid. Try connecting again.",
    auth: "You must be signed in to connect Clover.",
    forbidden: "You do not have access to connect Clover for this business.",
    no_merchant: "Clover did not return a merchant ID.",
    token_failed: "Could not complete the connection. Try again or contact support.",
};

export type CloverLastEventSummary = {
    status: string;
    customerEmail: string | null;
    createdAt: string;
};

export type CloverConnectionSummary = {
    merchantId: string;
    environment: string;
    connectedAt: string;
    autoSendEnabled: boolean;
    lastEvent: CloverLastEventSummary | null;
} | null;

type CloverCardProps = {
    businessId: string;
    connection: CloverConnectionSummary;
    configured: boolean;
};

export function CloverCard({ businessId, connection, configured }: CloverCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        if (searchParams.get("clover_connected") === "1") {
            toast.success("Clover connected.");
            router.replace("/settings/integrations");
        }
        const err = searchParams.get("clover_error");
        if (err) {
            toast.error(CLOVER_ERROR_MESSAGES[err] || "Clover connection failed");
            router.replace("/settings/integrations");
        }
    }, [searchParams, router]);

    function handleConnect() {
        if (!configured) {
            toast.error("Clover is not available right now. Contact support.");
            return;
        }
        setConnecting(true);
        window.location.href = `/api/integrations/clover/connect?businessId=${businessId}`;
    }

    const isConnected = Boolean(connection);

    return (
        <Card className="overflow-hidden border-chart-2/25">
            <div className="h-1 w-full bg-chart-2/90" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <BrandLogoTile domain="clover.com" name="Clover" />
                        <div>
                            <p className="text-base font-semibold">Clover</p>
                            <p className="text-sm text-muted-foreground">
                                Auto-send review requests after Clover payments
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={
                            isConnected
                                ? "border-0 bg-chart-2/15 text-xs text-success"
                                : "border-0 bg-muted text-xs text-muted-foreground"
                        }
                    >
                        {isConnected ? "Connected" : "Not connected"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
                {isConnected && connection ? (
                    <CloverCardConnected
                        businessId={businessId}
                        connection={connection}
                        configured={configured}
                        connecting={connecting}
                        onReconnect={handleConnect}
                    />
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground">
                            Connect Clover to auto-send review requests after payments when
                            enabled.
                        </p>
                        <Button
                            size="sm"
                            className="h-8 w-full text-xs"
                            onClick={handleConnect}
                            disabled={connecting || !configured}
                        >
                            {connecting ? (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            ) : (
                                <Link2 className="mr-1.5 size-3.5" />
                            )}
                            Connect Clover
                        </Button>
                        {!configured ? (
                            <p className="text-[11px] text-muted-foreground">
                                Set CLOVER_APP_ID / CLOVER_APP_SECRET to enable Connect.
                            </p>
                        ) : null}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
