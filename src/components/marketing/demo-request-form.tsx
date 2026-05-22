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
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Something went wrong");
                return;
            }
            setDone(true);
            e.currentTarget.reset();
        } catch {
            setError("Network error — try again");
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <p className="text-sm text-chart-2 text-center py-8">
                Thank you — our sales team will contact you within one business day.
            </p>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <input
                    name="name"
                    required
                    placeholder="Your name"
                    className="h-11 rounded-lg border border-border px-4 text-sm bg-background"
                />
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="Work email"
                    className="h-11 rounded-lg border border-border px-4 text-sm bg-background"
                />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <input
                    name="company"
                    required
                    placeholder="Company / brand"
                    className="h-11 rounded-lg border border-border px-4 text-sm bg-background"
                />
                <input
                    name="locations"
                    placeholder="Number of locations"
                    className="h-11 rounded-lg border border-border px-4 text-sm bg-background"
                />
            </div>
            <textarea
                name="message"
                rows={4}
                placeholder="What are you looking to solve? (optional)"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm bg-background"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request a demo"}
            </Button>
        </form>
    );
}
