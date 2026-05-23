"use client";

import { Check, Code2, Copy, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DeveloperApiCardKeySection({
    apiKey,
    maskedKey,
    showKey,
    onToggleShowKey,
    copied,
    onCopy,
    isGenerating,
    onGenerate,
}: {
    apiKey: string | null;
    maskedKey: string | null;
    showKey: boolean;
    onToggleShowKey: () => void;
    copied: boolean;
    onCopy: () => void;
    isGenerating: boolean;
    onGenerate: () => void;
}) {
    return (
        <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                API Key
            </label>
            {apiKey ? (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={showKey ? apiKey : (maskedKey || "")}
                            readOnly
                            className="font-mono text-xs bg-muted/50 pr-10"
                        />
                        <button
                            type="button"
                            onClick={onToggleShowKey}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <Button variant="outline" size="icon" className="shrink-0" onClick={onCopy}>
                        {copied ? <Check className="text-chart-2 size-4" /> : <Copy className="size-4" />}
                    </Button>
                </div>
            ) : (
                <Button onClick={onGenerate} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                        <Loader2 className="mr-2 animate-spin size-4" />
                    ) : (
                        <Code2 className="mr-2 size-4" />
                    )}
                    Generate API Key
                </Button>
            )}
        </div>
    );
}
