"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runGoogleSeoAeoSyncNow } from "@/app/actions/google-seo-aeo";
import { useRouter } from "next/navigation";

export function RunAuditControls({
    businessId,
}: {
    businessId: string;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [busy, setBusy] = useState(false);

    const runSync = () => {
        setBusy(true);
        startTransition(async () => {
            const r = await runGoogleSeoAeoSyncNow(businessId);
            if (r.success) {
                toast.success("Google SEO/AEO sync queued.");
                router.refresh();
            } else toast.error(r.error || "Failed to queue Google SEO/AEO sync.");
            setBusy(false);
        });
    };

    return (
        <div className="rounded-lg border p-3">
            <p className="text-sm font-medium mb-2">Google SEO/AEO Sync</p>
            <p className="text-xs text-muted-foreground mb-3">
                Runs this page audit pipeline only. Not tied to cron jobs or review sync.
            </p>
            <Button onClick={runSync} disabled={isPending || busy}>
                {busy ? <Loader2 className="mr-2 animate-spin size-4" /> : null}
                Sync
            </Button>
        </div>
    );
}

