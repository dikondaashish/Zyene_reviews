"use client";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, RefreshCw } from "lucide-react";

export function GoogleIntegrationCardSyncFooter({
    syncButtonBusy,
    isDisconnecting,
    needsLocation,
    onSync,
    onDisconnect,
}: {
    syncButtonBusy: boolean;
    isDisconnecting: boolean;
    needsLocation: boolean;
    onSync: () => void | Promise<void>;
    onDisconnect: () => void | Promise<void>;
}) {
    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button
                        type="button"
                        className="text-xs text-destructive hover:text-destructive dark:text-destructive dark:hover:text-destructive transition-colors font-medium"
                        disabled={isDisconnecting}
                    >
                        {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect Google?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will stop automatic review syncing. Your existing reviews will remain in Zyene but no
                            new reviews will be imported.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDisconnect} className="bg-destructive hover:bg-destructive/90">
                            Disconnect
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button
                variant="secondary"
                size="sm"
                onClick={() => void onSync()}
                disabled={syncButtonBusy || isDisconnecting || needsLocation}
            >
                {syncButtonBusy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync Now
            </Button>
        </>
    );
}
