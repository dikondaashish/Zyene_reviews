"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CLOVER_ERROR_MESSAGES: Record<string, string> = {
    denied: "Clover authorization was denied.",
    missing_params: "Clover returned incomplete OAuth parameters.",
    invalid_state: "Clover OAuth state was invalid. Try connecting again.",
    auth: "You must be signed in to connect Clover.",
    forbidden: "You do not have access to connect Clover for this business.",
    no_merchant: "Clover did not return a merchant ID.",
    token_failed: "Could not exchange the Clover authorization code. Check App ID/Secret.",
};

export type CloverConnectionSummary = {
    merchantId: string;
    environment: string;
    connectedAt: string;
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
            toast.success("Clover connected (sandbox).");
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
            toast.error("Clover is not configured yet. Add CLOVER_APP_ID and CLOVER_APP_SECRET.");
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
                        <div className="flex size-10 items-center justify-center rounded-lg border border-chart-2/25 bg-chart-2/10">
                            <CreditCard className="size-5 text-chart-2" />
                        </div>
                        <div>
                            <p className="text-base font-semibold">Clover</p>
                            <p className="text-sm text-muted-foreground">
                                Auto-detect payments and resolve customer contact (sandbox spike)
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={
                            isConnected
                                ? "border-0 bg-chart-2/15 text-xs text-chart-2"
                                : "border-0 bg-muted text-xs text-muted-foreground"
                        }
                    >
                        {isConnected ? "Connected" : "Not connected"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
                {isConnected && connection ? (
                    <p className="text-xs text-muted-foreground">
                        Merchant <span className="font-mono">{connection.merchantId}</span>
                        {" · "}
                        {connection.environment}
                    </p>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Phase 1 logs resolved email/phone from payments — does not send review
                        requests yet.
                    </p>
                )}
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
                    {isConnected ? "Reconnect Clover" : "Connect Clover"}
                </Button>
                {!configured ? (
                    <p className="text-[11px] text-muted-foreground">
                        Set CLOVER_APP_ID / CLOVER_APP_SECRET in the environment to enable Connect.
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
