"use client";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

export const SAMPLE_PAYLOAD = `{
  "name": "Sam Patel",
  "email": "sam@example.com",
  "phone": "+15551234567",
  "channel": "both"
}`;

export function ZapierExamplePayloadBlock({
    copied,
    onCopy,
}: {
    copied: boolean;
    onCopy: () => void;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Example JSON body
                </label>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onCopy}>
                    {copied ? (
                        <>
                            <Check className="mr-1 text-chart-2 size-3" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="mr-1 size-3" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
                {SAMPLE_PAYLOAD}
            </pre>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
                Optional <code className="font-mono">channel</code>:{" "}
                <code className="font-mono">sms</code>,{" "}
                <code className="font-mono">email</code>,{" "}
                <code className="font-mono">both</code>, or{" "}
                <code className="font-mono">link</code>. If omitted we pick
                automatically based on which fields you send.
            </p>
        </div>
    );
}
