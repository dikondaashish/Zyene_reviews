"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SQUARE_ERROR_MESSAGES: Record<string, string> = {
    denied: "Square authorization was denied.",
    missing_params: "Square returned incomplete OAuth parameters.",
    invalid_state: "Square OAuth state was invalid. Try connecting again.",
    auth: "You must be signed in to connect Square.",
    forbidden: "You do not have access to connect Square for this business.",
    no_merchant: "Square did not return a merchant ID.",
    token_failed:
        "Could not exchange the Square authorization code. Check SQUARE_APPLICATION_ID / SQUARE_APPLICATION_SECRET.",
    store_failed:
        "Square authorized, but saving the connection failed. Apply the square_connections migration in Supabase, then Connect again.",
};

export type SquareConnectionSummary = {
    merchantId: string;
    environment: string;
    connectedAt: string;
} | null;

type SquareCardProps = {
    businessId: string;
    connection: SquareConnectionSummary;
    configured: boolean;
};

export function SquareCard({ businessId, connection, configured }: SquareCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        if (searchParams.get("square_connected") === "1") {
            toast.success("Square connected (sandbox).");
            router.replace("/settings/integrations");
        }
        const err = searchParams.get("square_error");
        if (err) {
            toast.error(SQUARE_ERROR_MESSAGES[err] || "Square connection failed");
            router.replace("/settings/integrations");
        }
    }, [searchParams, router]);

    function handleConnect() {
        if (!configured) {
            toast.error(
                "Square is not configured yet. Add SQUARE_APPLICATION_ID and SQUARE_APPLICATION_SECRET.",
            );
            return;
        }
        setConnecting(true);
        window.location.href = `/api/integrations/square/connect?businessId=${businessId}`;
    }

    const isConnected = Boolean(connection);

    return (
        <Card className="overflow-hidden border-foreground/20">
            <div className="h-1 w-full bg-foreground/70" />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg border border-foreground/15 bg-foreground/5">
                            <Store className="size-5 text-foreground/70" />
                        </div>
                        <div>
                            <p className="text-base font-semibold">Square</p>
                            <p className="text-sm text-muted-foreground">
                                Auto-detect payments and resolve customer contact (sandbox spike)
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={
                            isConnected
                                ? "border-0 bg-foreground/10 text-xs text-foreground"
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
                        requests yet. For sandbox: open your Sandbox Seller Dashboard in another
                        tab first, then click Connect (otherwise Square returns a blank page /
                        400).
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
                    {isConnected ? "Reconnect Square" : "Connect Square"}
                </Button>
                {!configured ? (
                    <p className="text-[11px] text-muted-foreground">
                        Set SQUARE_APPLICATION_ID / SQUARE_APPLICATION_SECRET to enable Connect.
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
