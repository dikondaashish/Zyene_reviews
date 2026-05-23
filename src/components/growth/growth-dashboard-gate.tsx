"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GrowthDashboardGate() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/internal/growth-dashboard-auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError((data as { error?: string }).error ?? "Access denied");
                return;
            }
            window.location.reload();
        } catch {
            setError("Network error ,  try again");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8 shadow-sm"
            >
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Growth operations</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Internal KPI dashboard, page map, and implementation matrix. Not indexed.
                    </p>
                </div>
                <Input
                    type="password"
                    placeholder="Dashboard password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in…" : "Continue"}
                </Button>
            </form>
        </div>
    );
}
