"use client";

import { useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runGoogleSeoAeoSyncNow } from "@/app/actions/google-seo-aeo";
import { useRouter } from "next/navigation";

/** Re-runs this page's audit pipeline only - not tied to cron jobs or review sync. */
export function RunAuditControls({ businessId }: { businessId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const runSync = () => {
        startTransition(async () => {
            const r = await runGoogleSeoAeoSyncNow(businessId);
            if (r.success) {
                toast.success("Refresh queued. New results appear in a few minutes.");
                router.refresh();
            } else toast.error(r.error || "Could not start the refresh. Try again.");
        });
    };

    return (
        <Button variant="outline" onClick={runSync} disabled={isPending} className="shrink-0">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            {isPending ? "Refreshing…" : "Refresh audit"}
        </Button>
    );
}
