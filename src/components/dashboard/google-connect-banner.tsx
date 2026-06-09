"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GoogleConnectionStatus } from "@/lib/google/is-google-connected";

export function GoogleConnectBanner({
    status,
    businessName,
}: {
    status: GoogleConnectionStatus;
    businessName?: string | null;
}) {
    const pathname = usePathname();

    if (status === "connected") return null;
    if (pathname.startsWith("/settings/integrations")) return null;

    const scope = businessName?.trim() ? ` for ${businessName.trim()}` : "";
    const isReconnect = status === "needs_reconnect";

    return (
        <div className="w-full border-b border-chart-4/25 bg-chart-4/10 px-4 py-2.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 rounded-lg bg-chart-4/15 p-1.5 text-chart-4 shrink-0">
                    <AlertCircle className="size-4" />
                </div>
                <p className="text-sm font-medium text-foreground">
                    {isReconnect ? (
                        <>
                            Google connection expired{scope}. Reconnect to resume review sync and
                            Google insights.
                        </>
                    ) : (
                        <>
                            Google Business Profile is not connected{scope}. Connect to import real
                            reviews and unlock sync, replies, and analytics.
                        </>
                    )}
                </p>
            </div>
            <Button
                asChild
                size="sm"
                className="h-8 shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            >
                <Link href="/settings/integrations">
                    <Link2 className="mr-2 size-3.5" />
                    {isReconnect ? "Reconnect Google" : "Connect Google"}
                </Link>
            </Button>
        </div>
    );
}
