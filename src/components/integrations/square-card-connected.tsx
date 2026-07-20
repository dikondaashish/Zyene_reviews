"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link2, Loader2, Unplug } from "lucide-react";
import { toast } from "sonner";
import {
    disconnectSquare,
    setSquareAutoSend,
} from "@/app/(dashboard)/settings/integrations/square-actions";
import { googleCardTimeAgo } from "@/components/integrations/google-card-time-ago";
import { squareLastEventSummary } from "@/components/integrations/square-card-status";
import type { SquareConnectionSummary } from "@/components/integrations/square-card";

type Props = {
    businessId: string;
    connection: NonNullable<SquareConnectionSummary>;
    configured: boolean;
    connecting: boolean;
    onReconnect: () => void;
};

export function SquareCardConnected({
    businessId,
    connection,
    configured,
    connecting,
    onReconnect,
}: Props) {
    const router = useRouter();
    const [autoSend, setAutoSend] = useState(connection.autoSendEnabled);
    const [pending, startTransition] = useTransition();

    useEffect(() => {
        setAutoSend(connection.autoSendEnabled);
    }, [connection.autoSendEnabled]);

    function onAutoSendChange(next: boolean) {
        const prev = autoSend;
        setAutoSend(next);
        startTransition(async () => {
            const result = await setSquareAutoSend(businessId, next);
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
        if (!window.confirm("Disconnect Square? Auto-send will turn off.")) return;
        startTransition(async () => {
            const result = await disconnectSquare(businessId);
            if (!result.ok) {
                toast.error(result.error);
                return;
            }
            toast.success("Square disconnected");
            router.refresh();
        });
    }

    const lastLine = connection.lastEvent
        ? squareLastEventSummary({
              ...connection.lastEvent,
              timeAgo: googleCardTimeAgo,
          })
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
                    <Label htmlFor="square-auto-send" className="text-sm font-medium">
                        Auto-send review requests
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                        Email (or SMS) after a Square payment with a customer contact
                    </p>
                </div>
                <Switch
                    id="square-auto-send"
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
