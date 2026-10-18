"use client";

import { useState } from "react";
import { FreeToolShell } from "@/components/marketing/free-tools/free-tool-shell";
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
        <FreeToolShell
            title="Reputation Score Checker"
            lede="See your public Google rating and review count instantly. Optionally email yourself the same snapshot."
            whyTitle="What your reputation score shows"
            why={<>
                <p>
                        Your Google rating and review count are often the first signals new customers see in local
                        search. This checker shows those public Google metrics. It cannot measure response coverage
                        without access to your connected review data.
                    </p>
                    <p>
                        Improving your score usually means collecting more recent reviews and responding consistently.
                        Zyene Reviews automates both with alerts, AI replies, and review request campaigns from $29.99/mo.
                    </p>
            </>}
        >
<div className="mi-panel tool-form">
                        <label htmlFor="reputation-business" className="text-sm font-medium block">Your business</label>
                        <PlaceSearchInput id="reputation-business" onSelect={(p) => { setPlace(p); setPreview(null); setFullSent(false); setError(""); }} />
                        <button type="button" onClick={() => run(true)} disabled={loading || !place} aria-busy={loading} className="marketing-button w-full disabled:pointer-events-none disabled:opacity-60" data-track="tool" data-track-location="reputation-score-checker">
                            {loading ? <FreeToolLoadingLabel text="Checking reputation" /> : "Check reputation"}
                        </button>
                    </div>
                    {preview && (
                        <div className="mi-panel tool-stats">
                            <div className="tool-stat">
                                <Star aria-hidden="true" className="tool-stat-star size-5" />
                                <p className="mi-card-value">{preview.totalReviews ? preview.averageRating.toFixed(1) : "—"}</p>
                                <p className="text-xs text-muted-foreground">Avg rating</p>
                            </div>
                            <div className="tool-stat">
                                <p className="mi-card-value">{preview.totalReviews}</p>
                                <p className="text-xs text-muted-foreground">Reviews</p>
                            </div>
                            <p className="tool-stats-name">{preview.name}</p>
                        </div>
                    )}
                    {preview && !fullSent && (
                        <form
                            className="mi-panel tool-form"
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
                            <button type="submit" disabled={loading} aria-busy={loading} className="marketing-button marketing-button-secondary w-full disabled:pointer-events-none disabled:opacity-60" data-track="tool" data-track-location="reputation-score-checker">
                                {loading ? <FreeToolLoadingLabel text="Sending snapshot" /> : "Email snapshot"}
                            </button>
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
        </FreeToolShell>
    );
}
