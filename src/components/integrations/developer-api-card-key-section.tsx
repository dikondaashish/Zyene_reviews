"use client";

import { Check, Code2, Copy, Loader2, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PublicApiKey } from "@/lib/api-keys/credentials";

export function DeveloperApiCardKeySection({
    apiKey,
    newSecret,
    copied,
    pending,
    canManage,
    onCopy,
    onDismiss,
    onCreate,
}: {
    apiKey: PublicApiKey | null;
    newSecret: string | null;
    copied: boolean;
    pending: boolean;
    canManage: boolean;
    onCopy: () => void;
    onDismiss: () => void;
    onCreate: () => void;
}) {
    return (
        <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                API key
            </label>
            {newSecret ? (
                <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Copy this key now</p>
                            <p className="text-xs text-muted-foreground">
                                It is shown once and cannot be viewed again.
                            </p>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={onDismiss} aria-label="Dismiss key">
                            <X className="size-4" />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Input value={newSecret} readOnly className="bg-background font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={onCopy} aria-label="Copy API key">
                            {copied ? <Check className="size-4 text-chart-2" /> : <Copy className="size-4" />}
                        </Button>
                    </div>
                </div>
            ) : apiKey ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                    <ShieldCheck className="size-4 text-chart-2" />
                    <div className="min-w-0">
                        <p className="font-mono text-xs">{apiKey.keyPrefix}••••••••••••</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {apiKey.scopes.join(", ")}
                        </p>
                    </div>
                </div>
            ) : canManage ? (
                <Button onClick={onCreate} disabled={pending} className="w-full">
                    {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Code2 className="mr-2 size-4" />}
                    Create API key
                </Button>
            ) : (
                <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                    Only a business owner or admin can create an API key.
                </p>
            )}
        </div>
    );
}
