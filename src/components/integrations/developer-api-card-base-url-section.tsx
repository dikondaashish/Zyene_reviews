"use client";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DeveloperApiCardBaseUrlSection({
    apiBase,
    baseCopied,
    onCopyBaseUrl,
}: {
    apiBase: string;
    baseCopied: boolean;
    onCopyBaseUrl: () => void;
}) {
    return (
        <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    API base URL
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground"
                    onClick={onCopyBaseUrl}
                >
                    {baseCopied ? <Check className="text-chart-2 size-3.5" /> : <Copy className="size-3.5" />}
                    <span className="ml-1.5">Copy</span>
                </Button>
            </div>
            <code className="block break-all rounded-md bg-background/80 px-2 py-1.5 font-mono text-[11px] text-foreground ring-1 ring-border/60">
                {apiBase}
            </code>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
                Send <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">X-API-Key: zy_…</code> or{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Authorization: Bearer zy_…</code>.
                Successful JSON looks like{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{`{ "success": true, "data": … }`}</code>.
                Prefer calling the API from your server so the key never ships to browsers.
            </p>
        </div>
    );
}
