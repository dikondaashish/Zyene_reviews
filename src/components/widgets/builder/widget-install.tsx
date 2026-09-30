"use client";

import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { toast } from "sonner";
import { buildConfiguredEmbed } from "@/lib/widgets/configured-embed";
import type { WidgetConfig } from "@/lib/widgets/config";

export function WidgetInstall({ slug, config }: { slug: string; config: WidgetConfig }) {
    const [copied, setCopied] = useState("");
    const embed = buildConfiguredEmbed(slug, config);
    const copy = async (code: string) => {
        try { await navigator.clipboard.writeText(code); setCopied(code); toast.success("Widget code copied"); }
        catch { toast.error("Copy is unavailable. Select and copy the code below."); }
    };
    return <div className="wb-install">
        <Code2 size={28} /><h3>Add to your website</h3>
        <p>Paste this code into a Custom HTML block on your website. It adjusts to mobile and desktop automatically.</p>
        <textarea readOnly aria-label="Widget installation code" value={embed.code} onFocus={e => e.target.select()} rows={6} />
        <button className="wb-primary" onClick={() => copy(embed.code)}>{copied === embed.code ? <Check size={17} /> : <Copy size={17} />} {copied === embed.code ? "Copied" : "Copy installation code"}</button>
        <details><summary>Iframe alternative</summary><p>For platforms that block scripts. This version uses a fixed height and does not float.</p>
            <textarea readOnly aria-label="Iframe code" value={embed.iframe} onFocus={e => e.target.select()} rows={5} />
            <button className="wb-secondary" onClick={() => copy(embed.iframe)}>{copied === embed.iframe ? "Copied" : "Copy iframe"}</button>
        </details>
        <p>Newly synced reviews appear when your website loads. Design changes require replacing the embed code.</p>
    </div>;
}
