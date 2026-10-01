"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export function WidgetSummaryGenerate({ slug, source, onGenerated }: { slug: string; source: "google" | "all"; onGenerated: () => void }) {
    const [busy, setBusy] = useState(false);
    const generate = async () => {
        setBusy(true);
        try {
            const response = await fetch("/api/widgets/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, source }) });
            const result = await response.json();
            if (response.ok && result.success) { toast.success("Review summary is ready"); onGenerated(); }
            else toast.error(result.error || "Unable to generate summary");
        } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to generate summary"); }
        setBusy(false);
    };
    return <button className="wb-primary" disabled={busy} onClick={generate}><Sparkles size={16} />{busy ? "Generating summary…" : "Generate review summary"}</button>;
}
