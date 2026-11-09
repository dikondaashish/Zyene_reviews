"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link2, Loader2, Unplug } from "lucide-react";
import { toast } from "sonner";
import {
    disconnectClover,
    setCloverAutoSend,
} from "@/app/(dashboard)/settings/integrations/clover-actions";
import { googleCardTimeAgo } from "@/components/integrations/google-card-time-ago";
import { squareLastEventSummary } from "@/components/integrations/square-card-status";
import type { CloverConnectionSummary } from "@/components/integrations/clover-card";

type Props = {
    businessId: string;
    connection: NonNullable<CloverConnectionSummary>;
    configured: boolean;
    connecting: boolean;
    onReconnect: () => void;
};

export function CloverCardConnected({
    businessId,
    connection,
    configured,
    connecting,
    onReconnect,
}: Props) {
    const router = useRouter();
    const [autoSend, setAutoSend] = useState(connection.autoSendEnabled);
    const [syncedFrom, setSyncedFrom] = useState(connection.autoSendEnabled);
    const [pending, startTransition] = useTransition();

    // Re-sync when the server value changes (after router.refresh()).
    if (syncedFrom !== connection.autoSendEnabled) {
        setSyncedFrom(connection.autoSendEnabled);
        setAutoSend(connection.autoSendEnabled);
    }

    function onAutoSendChange(next: boolean) {
        const prev = autoSend;
        setAutoSend(next);
        startTransition(async () => {
            const result = await setCloverAutoSend(businessId, next);
            if (!result.ok) {
                setAutoSend(prev);
                toast.error(result.error);
                return;
            }
            toast.success(next ? "Auto-send enabled" : "Auto-send disabled");
            router.refresh();
        });
    }

    function onDisconnect() {
        if (!window.confirm("Disconnect Clover? Auto-send will turn off.")) return;
        startTransition(async () => {
            const result = await disconnectClover(businessId);
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            toast.success("Clover disconnected");
            router.refresh();
        });
    }

    const lastLine = connection.lastEvent
        ? squareLastEventSummary({ ...connection.lastEvent, timeAgo: googleCardTimeAgo })
        : "No payments processed yet";

    return (
        <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
                Merchant <span className="font-mono">{connection.merchantId}</span>
                {" · "}
                {connection.environment}
            </p>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-3 py-2.5">
                <div className="min-w-0 space-y-0.5">
                    <Label htmlFor="clover-auto-send" className="text-sm font-medium">
                        Auto-send review requests
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                        Email (or SMS) after a Clover payment with a customer contact
                    </p>
                </div>
                <Switch
                    id="clover-auto-send"
                    checked={autoSend}
                    disabled={pending}
                    onCheckedChange={onAutoSendChange}
                />
            </div>
            <p className="text-[11px] text-muted-foreground">Last payment: {lastLine}</p>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    className="h-8 flex-1 text-xs"
                    onClick={onReconnect}
                    disabled={connecting || !configured || pending}
                >
                    {connecting ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                        <Link2 className="mr-1.5 size-3.5" />
                    )}
                    Reconnect
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={onDisconnect}
                    disabled={pending}
                >
                    {pending ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                        <Unplug className="mr-1.5 size-3.5" />
                    )}
                    Disconnect
                </Button>
            </div>
        </div>
    );
}
