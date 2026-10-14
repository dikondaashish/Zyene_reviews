"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runSamplingNow } from "./run-sampling-action";

export function RunSamplingControl({ businessId, activePrompts, enabled }: { businessId: string; activePrompts: number; enabled: boolean }) {
    const [attempts, setAttempts] = useState(1); const [pending, setPending] = useState(false);
    async function run() {
        if (!window.confirm(`Run ${activePrompts} active prompts across every configured engine with ${attempts} observation${attempts === 1 ? "" : "s"} each? Each successful answer uses AEO credit, and anything past your credit is billed as overage.`)) return;
        setPending(true); const result = await runSamplingNow({ businessId, attempts }); setPending(false);
        if (!result.ok) toast.error(result.error); else toast.success(`Sampling queued across ${result.engines} engines.`);
    }
    return <div className="space-y-2 border-t pt-4"><p className="text-sm font-medium">Manual sampling</p><div className="flex gap-2"><select aria-label="Observations per prompt" className="h-9 rounded-md border bg-background px-2 text-sm" value={attempts} onChange={(event) => setAttempts(Number(event.target.value))}><option value={1}>1 observation</option><option value={3}>3 observations</option><option value={5}>5 observations</option></select><Button onClick={run} disabled={!enabled || !activePrompts || pending}><Play className="size-4" />{pending ? "Queuing..." : "Run now"}</Button></div><p className="text-xs text-muted-foreground">Use 3-5 observations to measure variance. Each successful answer is one test: it uses your plan&apos;s AEO credit, and tests past that credit are billed as overage.</p></div>;
}
