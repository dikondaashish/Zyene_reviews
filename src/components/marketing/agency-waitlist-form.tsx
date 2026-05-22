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
            const json = await res.json();
            if (!res.ok) {
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
        return <p className="text-sm text-chart-2">You&apos;re on the waitlist — we&apos;ll email you when the agency dashboard opens.</p>;
    }

    return (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
            <input
                name="email"
                type="email"
                required
                placeholder="Work email"
                className="flex-1 h-11 rounded-lg border border-border px-4 text-sm"
            />
            <input
                name="agencyName"
                placeholder="Agency name"
                className="flex-1 h-11 rounded-lg border border-border px-4 text-sm"
            />
            <input
                name="clientCount"
                placeholder="# clients"
                className="w-28 h-11 rounded-lg border border-border px-4 text-sm"
            />
            <Button type="submit" disabled={loading} className="shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join waitlist"}
            </Button>
            {error && <p className="text-sm text-destructive sm:col-span-3">{error}</p>}
        </form>
    );
}
