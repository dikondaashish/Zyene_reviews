"use client";

import { useState } from "react";
import { KeyRound, RadioTower } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SecretCreator({ businessId, kind }: { businessId: string; kind: "api" | "logs" }) {
    const [secret, setSecret] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    async function submit(formData: FormData) {
        setPending(true); setSecret(null);
        const endpoint = kind === "api" ? "/api/integrations/api-key" : "/api/aeo/crawler-log-sources";
        const body = kind === "api"
            ? { businessId, name: String(formData.get("name")), scopes: ["prompts:read", "results:read", "citations:read", "scores:read"], rateLimitPerMinute: 60 }
            : { businessId, name: String(formData.get("name")), source: String(formData.get("source")) };
        try {
            const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const result = await response.json() as { apiKey?: string; key?: string; error?: string };
            if (!response.ok) throw new Error(result.error ?? "Creation failed");
            setSecret(result.apiKey ?? result.key ?? null); toast.success("Credential created");
        } catch (error) { toast.error(error instanceof Error ? error.message : "Creation failed"); }
        finally { setPending(false); }
    }
    return (
        <form action={submit} className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">{kind === "api" ? <KeyRound className="size-4" /> : <RadioTower className="size-4" />}{kind === "api" ? "Scoped REST API key" : "Crawler log source"}</div>
            <div className="flex flex-wrap gap-2">
                <Input name="name" required minLength={2} maxLength={80} placeholder={kind === "api" ? "Reporting integration" : "Production log drain"} className="max-w-xs" />
                {kind === "logs" ? <select name="source" className="h-9 rounded-md border bg-background px-3 text-sm"><option value="vercel">Vercel</option><option value="cloudflare">Cloudflare</option><option value="proxy">Proxy</option></select> : null}
                <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create"}</Button>
            </div>
            {secret ? <div className="rounded border border-warning/40 bg-warning/10 p-3 text-xs"><p className="font-medium">Shown once</p><code className="mt-1 block break-all select-all">{secret}</code></div> : null}
        </form>
    );
}
