"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function DemoRequestForm() {
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
            const res = await fetch("/api/marketing/demo-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fd.get("name"),
                    email: fd.get("email"),
                    company: fd.get("company"),
                    locations: fd.get("locations"),
                    message: fd.get("message"),
                }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setError(json.error ?? "Something went wrong");
                return;
            }
            setDone(true);
            e.currentTarget.reset();
        } catch {
            setError("Network error—try again");
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <p className="text-sm text-chart-2 text-center py-8">
                Thank you—our sales team will contact you within one business day.
            </p>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Your name
                    <input name="name" autoComplete="name" required className="h-11 rounded-lg border border-border px-4 text-sm bg-background font-normal" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Work email
                    <input name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="h-11 rounded-lg border border-border px-4 text-sm bg-background font-normal" />
                </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Company or brand
                    <input name="company" autoComplete="organization" required className="h-11 rounded-lg border border-border px-4 text-sm bg-background font-normal" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                    Number of locations
                    <input name="locations" inputMode="numeric" placeholder="10" className="h-11 rounded-lg border border-border px-4 text-sm bg-background font-normal" />
                </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium">
                What are you looking to solve? <span className="text-muted-foreground font-normal">(optional)</span>
                <textarea name="message" rows={4} className="w-full rounded-lg border border-border px-4 py-3 text-sm bg-background font-normal" />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin size-4" /> : "Request a demo"}
            </Button>
        </form>
    );
}
