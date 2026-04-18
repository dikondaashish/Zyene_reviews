"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SHELL_COMMANDS = new Set([
    "git",
    "curl",
    "mkdir",
    "cp",
    "cd",
    "pnpm",
    "npm",
    "npx",
    "export",
    "source",
    "chmod",
    "echo",
    "cat",
    "ls",
    "mv",
    "rm",
    "touch",
    "open",
]);

function splitWithUrls(text: string): { text: string; url: boolean }[] {
    const out: { text: string; url: boolean }[] = [];
    const re = /(https?:\/\/[^\s]+)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) out.push({ text: text.slice(last, m.index), url: false });
        out.push({ text: m[1], url: true });
        last = m.index + m[1].length;
    }
    if (last < text.length) out.push({ text: text.slice(last), url: false });
    if (out.length === 0) out.push({ text, url: false });
    return out;
}

function HighlightedShellLine({ line }: { line: string }) {
    const trimmed = line.trimStart();
    if (trimmed === "") {
        return <span className="block min-h-[1.25em]">&nbsp;</span>;
    }

    const leading = line.slice(0, line.length - trimmed.length);

    if (/^#/.test(trimmed)) {
        return (
            <span className="block whitespace-pre">
                {leading}
                <span className="text-muted-foreground">{trimmed}</span>
            </span>
        );
    }

    const match = trimmed.match(/^(\S+)(\s*)([\s\S]*)$/);
    if (match) {
        const [, cmd, gap, after] = match;
        if (SHELL_COMMANDS.has(cmd)) {
            return (
                <span className="block whitespace-pre">
                    {leading}
                    <span className="font-semibold text-primary">{cmd}</span>
                    {gap}
                    <span className="text-foreground">
                        {splitWithUrls(after).map((seg, i) =>
                            seg.url ? (
                                <span key={i} className="text-primary underline decoration-primary/30">
                                    {seg.text}
                                </span>
                            ) : (
                                <span key={i}>{seg.text}</span>
                            )
                        )}
                    </span>
                </span>
            );
        }
    }

    return (
        <span className="block whitespace-pre text-foreground">
            {splitWithUrls(line).map((seg, i) =>
                seg.url ? (
                    <span key={i} className="text-primary underline decoration-primary/30">
                        {seg.text}
                    </span>
                ) : (
                    <span key={i}>{seg.text}</span>
                )
            )}
        </span>
    );
}

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
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
                {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
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
