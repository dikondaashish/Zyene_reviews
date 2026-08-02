"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AgencyWaitlistForm() {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError("");
        const fd = new FormData(e.currentTarget);
        try {
            const res = await fetch("/api/marketing/agency-waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: fd.get("email"),
                    agencyName: fd.get("agencyName"),
                    clientCount: fd.get("clientCount"),
                }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setError(json.error ?? "Failed");
                return;
            }
            setDone(true);
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return <p className="text-sm text-chart-2">You&apos;re on the waitlist, we&apos;ll email you when the agency dashboard opens.</p>;
    }

    return (
        <form onSubmit={submit} className="flex flex-col items-end sm:flex-row gap-3">
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-foreground">
                Work email
                <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@agency.com"
                    className="h-11 rounded-lg border border-border px-4 text-sm font-normal"
                />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-foreground">
                Agency name
                <input
                    name="agencyName"
                    autoComplete="organization"
                    placeholder="Acme Agency"
                    className="h-11 rounded-lg border border-border px-4 text-sm font-normal"
                />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
                Clients
                <input
                    name="clientCount"
                    inputMode="numeric"
                    placeholder="25"
                    className="w-28 h-11 rounded-lg border border-border px-4 text-sm font-normal"
                />
            </label>
            <Button type="submit" disabled={loading} className="shrink-0">
                {loading ? <Loader2 className="animate-spin size-4" /> : "Join waitlist"}
            </Button>
            {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}
        </form>
    );
}
