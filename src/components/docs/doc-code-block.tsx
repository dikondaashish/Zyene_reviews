"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HighlightedShellLine } from "./doc-code-block-shell-highlight";

export type DocCodeBlockProps = {
    /** Raw source (shown and copied exactly, including newlines). */
    code: string;
    /** Optional label above the code (e.g. `bash`). */
    language?: string;
    className?: string;
};

/**
 * Docs code snippet: light panel, monospace, shell-ish highlighting, copy control (reference: Mintlify-style install blocks).
 */
export function DocCodeBlock({ code, language, className }: DocCodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const lines = code.replace(/\n$/, "").split("\n");

    async function copy() {
        try {
            await navigator.clipboard.writeText(code.trimEnd() + (code.endsWith("\n") ? "\n" : ""));
            setCopied(true);
            toast.success("Copied to clipboard");
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy");
        }
    }

    return (
        <div
            className={cn(
                "not-prose relative my-6 rounded-xl border border-border bg-muted/70 shadow-sm",
                className
            )}
        >
            {language ? (
                <div className="absolute left-3 top-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {language}
                </div>
            ) : null}
            <button
                type="button"
                onClick={copy}
                aria-label="Copy code"
                className="absolute right-2 top-2 inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground size-8"
            >
                {copied ? <Check className="text-chart-2 dark:text-chart-2 size-4" /> : <Copy className="size-4" />}
            </button>
            <pre
                className="max-h-[min(28rem,70vh)] overflow-auto px-4 pb-4 pt-10 font-mono text-[13px] leading-[1.65] text-foreground"
            >
                <code>
                    {lines.map((line, i) => (
                        <HighlightedShellLine key={i} line={line} />
                    ))}
                </code>
            </pre>
        </div>
    );
}
