"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PlayCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { runTechnicalAuditNow } from "./run-audit-action";
import type { AuditRun } from "./load-audit-page-data";

/** F5 manual trigger. Polls while a run is in flight - the same "running" refresh pattern the Google sync card already uses. */
export function AuditRunControls({
    businessId,
    latestRun,
    liveCrawlingEnabled,
}: {
    businessId: string;
    latestRun: AuditRun | null;
    liveCrawlingEnabled: boolean;
}) {
    const router = useRouter();
    const [starting, setStarting] = React.useState(false);
    const isRunning = latestRun?.status === "running";

    React.useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => router.refresh(), 4000);
        return () => clearInterval(interval);
    }, [isRunning, router]);

    async function handleRun() {
        setStarting(true);
        const result = await runTechnicalAuditNow(businessId);
        setStarting(false);
        if (!result.success) {
            toast.error(result.error);
            return;
        }
        toast.success("Technical audit started. This runs in the background and can take a minute or two.");
        router.refresh();
    }

    if (!liveCrawlingEnabled) {
        return (
            <Alert>
                <AlertTriangle className="size-4" />
                <AlertTitle>Technical audits are switched off</AlertTitle>
                <AlertDescription>
                    New audits are currently unavailable. Any findings below are historical. Contact support for availability.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-3">
            {isRunning ? (
                <Alert>
                    <Loader2 className="size-4 animate-spin" />
                    <AlertTitle>Audit in progress</AlertTitle>
                    <AlertDescription>
                        Crawling {latestRun.origin}. Page counts are written once the crawl finishes, not
                        live - this can take a minute or two depending on site size. This page checks
                        automatically.
                    </AlertDescription>
                </Alert>
            ) : (
                <Button onClick={handleRun} disabled={starting}>
                    {starting ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <PlayCircle className="mr-2 size-4" />
                    )}
                    {latestRun ? "Run audit again" : "Run technical audit"}
                </Button>
            )}

            {latestRun?.status === "failed" && (
                <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Last audit failed</AlertTitle>
                    <AlertDescription>{latestRun.errorMessage ?? "Unknown error."}</AlertDescription>
                </Alert>
            )}

            {latestRun?.status === "partial" && (
                <Alert>
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Partial coverage</AlertTitle>
                    <AlertDescription>
                        Crawled {latestRun.pagesCrawled} of {latestRun.pagesDiscovered} discovered pages
                        (plan cap: {latestRun.pageCap}). Findings below reflect only the pages crawled.
                    </AlertDescription>
                </Alert>
            )}

            {latestRun?.status === "success" && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-success" />
                    Last ran {new Date(latestRun.startedAt).toLocaleString()} - {latestRun.pagesCrawled} pages
                    crawled.
                </p>
            )}
        </div>
    );
}
