"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceSearchInput, type PlaceSuggestion } from "@/components/marketing/free-tools/place-search-input";
import { Loader2, Star } from "lucide-react";

type Preview = {
    name: string;
    averageRating: number;
    totalReviews: number;
    estimatedResponseRatePct: number;
};

export function ReputationScoreCheckerClient() {
    const [place, setPlace] = useState<PlaceSuggestion | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<Preview | null>(null);
    const [fullSent, setFullSent] = useState(false);
    const [error, setError] = useState("");

    async function run(previewOnly: boolean) {
        if (!place) {
            setError("Select your business first");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/marketing/tools/reputation-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    placeId: place.placeId,
                    email: previewOnly ? undefined : email,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Failed");
                return;
            }
            setPreview(json.preview);
            if (json.fullReport) setFullSent(true);
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <section className="pt-16 pb-12 px-4 border-b border-border">
                <div className="container mx-auto max-w-2xl">
                    <Link href="/tools" className="text-sm text-primary hover:underline">← All free tools</Link>
                    <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-3">Reputation Score Checker</h1>
                    <p className="text-muted-foreground">
                        See your public Google rating and review count instantly. Enter your email for the full report in your inbox.
                    </p>
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-2xl space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
                        <PlaceSearchInput onSelect={(p) => { setPlace(p); setPreview(null); }} />
                        <Button type="button" onClick={() => run(true)} disabled={loading || !place} className="w-full">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check reputation"}
                        </Button>
                    </div>
                    {preview && (
                        <div className="bg-card border border-border rounded-2xl p-6 grid gap-4 sm:grid-cols-3">
                            <div className="text-center p-4 rounded-xl bg-muted/40">
                                <Star className="h-6 w-6 text-chart-4 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{preview.averageRating.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Avg rating</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-muted/40">
                                <p className="text-2xl font-bold">{preview.totalReviews}</p>
                                <p className="text-xs text-muted-foreground">Reviews</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-muted/40">
                                <p className="text-2xl font-bold">~{preview.estimatedResponseRatePct}%</p>
                                <p className="text-xs text-muted-foreground">Est. response rate</p>
                            </div>
                            <p className="sm:col-span-3 text-sm text-muted-foreground text-center">{preview.name}</p>
                        </div>
                    )}
                    {preview && !fullSent && (
                        <form
                            className="bg-card border border-border rounded-2xl p-6 space-y-4"
                            onSubmit={(e) => { e.preventDefault(); run(false); }}
                        >
                            <p className="text-sm font-medium">Get the full report by email</p>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 rounded-lg border border-border px-4 text-sm"
                                placeholder="you@business.com"
                            />
                            <Button type="submit" disabled={loading} className="w-full">
                                Email full report
                            </Button>
                        </form>
                    )}
                    {fullSent && <p className="text-sm text-chart-2 text-center">Full report sent — check your inbox.</p>}
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                </div>
            </section>
        </div>
    );
}
