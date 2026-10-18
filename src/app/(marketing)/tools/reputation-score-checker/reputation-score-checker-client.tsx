"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceSearchInput, type PlaceSuggestion } from "@/components/marketing/free-tools/place-search-input";
import { FreeToolEmailDisclosure } from "@/components/marketing/free-tools/free-tool-email-disclosure";
import { FreeToolLoadingLabel } from "@/components/marketing/free-tools/free-tool-loading-label";
import { FreeToolResultCta } from "@/components/marketing/free-tools/free-tool-result-cta";
import { trackToolUsed } from "@/lib/free-tools/track-tool-used";
import { Star } from "lucide-react";

type Preview = {
    name: string;
    averageRating: number;
    totalReviews: number;
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
            setFullSent(Boolean(json.emailSent));
            trackToolUsed("reputation-score-checker");
            if (json.emailWarning) setError(json.emailWarning);
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
                    <h1 className="text-[length:var(--fs-display)] font-semibold mt-4 mb-3">Reputation Score Checker</h1>
                    <p className="text-muted-foreground">
                        See your public Google rating and review count instantly. Optionally email yourself the same snapshot.
                    </p>
                </div>
            </section>
            <section className="py-10 px-4 bg-muted/20 border-b border-border">
                <div className="container mx-auto max-w-2xl space-y-4">
                    <h2 className="text-xl font-bold text-foreground">What your reputation score shows</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Your Google rating and review count are often the first signals new customers see in local
                        search. This checker shows those public Google metrics. It cannot measure response coverage
                        without access to your connected review data.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Improving your score usually means collecting more recent reviews and responding consistently.
                        Zyene Reviews automates both with alerts, AI replies, and review request campaigns from $29.99/mo.
                    </p>
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-2xl space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
                        <label htmlFor="reputation-business" className="text-sm font-medium block">Your business</label>
                        <PlaceSearchInput id="reputation-business" onSelect={(p) => { setPlace(p); setPreview(null); setFullSent(false); setError(""); }} />
                        <Button type="button" onClick={() => run(true)} disabled={loading || !place} aria-busy={loading} className="w-full" data-track="tool" data-track-location="reputation-score-checker">
                            {loading ? <FreeToolLoadingLabel text="Checking reputation" /> : "Check reputation"}
                        </Button>
                    </div>
                    {preview && (
                        <div className="bg-card border border-border rounded-2xl p-6 grid gap-4 sm:grid-cols-2">
                            <div className="text-center p-4 rounded-xl bg-muted/40">
                                <Star aria-hidden="true" className="text-chart-4 mx-auto mb-2 size-6" />
                                <p className="text-2xl font-bold">{preview.totalReviews ? preview.averageRating.toFixed(1) : "—"}</p>
                                <p className="text-xs text-muted-foreground">Avg rating</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-muted/40">
                                <p className="text-2xl font-bold">{preview.totalReviews}</p>
                                <p className="text-xs text-muted-foreground">Reviews</p>
                            </div>
                            <p className="sm:col-span-2 text-sm text-muted-foreground text-center">{preview.name}</p>
                        </div>
                    )}
                    {preview && !fullSent && (
                        <form
                            className="bg-card border border-border rounded-2xl p-6 space-y-4"
                            onSubmit={(e) => { e.preventDefault(); run(false); }}
                        >
                            <label htmlFor="reputation-email" className="text-sm font-medium block">Email a copy of this snapshot</label>
                            <input
                                id="reputation-email"
                                type="email"
                                autoComplete="email"
                                aria-describedby="reputation-email-disclosure"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 rounded-lg border border-border px-4 text-sm"
                                placeholder="you@business.com"
                            />
                            <FreeToolEmailDisclosure id="reputation-email-disclosure" />
                            <Button type="submit" disabled={loading} aria-busy={loading} className="w-full" data-track="tool" data-track-location="reputation-score-checker">
                                {loading ? <FreeToolLoadingLabel text="Sending snapshot" /> : "Email snapshot"}
                            </Button>
                        </form>
                    )}
                    {fullSent && <p role="status" className="text-sm text-success text-center">Snapshot accepted for email delivery. Check your inbox.</p>}
                    {error && <p role="alert" className="text-sm text-destructive text-center">{error}</p>}
                    {preview && (
                        <FreeToolResultCta
                            toolSlug="reputation-score-checker"
                            message="Grow your rating with automated review requests, alerts, and reply drafts in Zyene Reviews."
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
