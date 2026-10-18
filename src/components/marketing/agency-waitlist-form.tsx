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
        return <p role="status" className="text-sm text-success">You&apos;re on the waitlist, we&apos;ll email you when the agency dashboard opens.</p>;
    }

    return (
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex w-full flex-col gap-1 text-xs font-medium text-foreground sm:w-auto sm:flex-1">
                Work email
                <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@agency.com"
                    className="h-11 w-full rounded-lg border border-border px-4 text-sm font-normal"
                />
            </label>
            <label className="flex w-full flex-col gap-1 text-xs font-medium text-foreground sm:w-auto sm:flex-1">
                Agency name
                <input
                    name="agencyName"
                    autoComplete="organization"
                    placeholder="Acme Agency"
                    className="h-11 w-full rounded-lg border border-border px-4 text-sm font-normal"
                />
            </label>
            <label className="flex w-full flex-col gap-1 text-xs font-medium text-foreground sm:w-auto">
                Clients
                <input
                    name="clientCount"
                    inputMode="numeric"
                    placeholder="25"
                    className="h-11 w-full rounded-lg sm:w-28 border border-border px-4 text-sm font-normal"
                />
            </label>
            <Button type="submit" disabled={loading} aria-busy={loading} className="h-11 w-full shrink-0 sm:w-auto">
                {loading ? <><Loader2 aria-hidden="true" className="animate-spin size-4" /><span className="sr-only">Joining waitlist</span></> : "Join waitlist"}
            </Button>
            {error && <p role="alert" className="w-full text-sm text-destructive">{error}</p>}
        </form>
    );
}
