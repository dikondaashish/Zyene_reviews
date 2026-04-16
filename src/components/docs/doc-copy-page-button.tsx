"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DocCopyPageButtonProps = {
    containerId: string;
    className?: string;
};

export function DocCopyPageButton({ containerId, className }: DocCopyPageButtonProps) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        const el = document.getElementById(containerId);
        if (!el) {
            toast.error("Nothing to copy on this page.");
            return;
        }

        const text = el.innerText
            .replace(/\u00a0/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Copied page text");
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Could not copy. Check browser permissions.");
        }
    }

    return (
        <button
            type="button"
            onClick={copy}
            className={cn(
                "hidden md:inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm text-foreground transition-colors hover:bg-muted",
                className
            )}
        >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            Copy page
        </button>
    );
}
