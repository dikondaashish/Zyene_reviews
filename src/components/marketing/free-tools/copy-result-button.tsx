"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyResultButton({ text }: { text: string }) {
    const [message, setMessage] = useState("");
    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setMessage("Copied to clipboard.");
        } catch {
            setMessage("Select the text above and copy it manually.");
        }
    }
    return <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={copy}>Copy result</Button>
        <span role="status" className="text-sm text-muted-foreground">{message}</span>
    </div>;
}
