"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceSearchInput, type PlaceSuggestion } from "@/components/marketing/free-tools/place-search-input";
import { CopyResultButton } from "@/components/marketing/free-tools/copy-result-button";
import { FreeToolEmailDisclosure } from "@/components/marketing/free-tools/free-tool-email-disclosure";
import { FreeToolLoadingLabel } from "@/components/marketing/free-tools/free-tool-loading-label";
import { FreeToolResultCta } from "@/components/marketing/free-tools/free-tool-result-cta";
import { trackToolUsed } from "@/lib/free-tools/track-tool-used";

export function ReviewLinkGeneratorClient() {
    const [place, setPlace] = useState<PlaceSuggestion | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ reviewLink: string; businessName: string; emailSent: boolean } | null>(null);
    const [error, setError] = useState("");

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!place) {
            setError("Select your business from the list");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/marketing/tools/review-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, placeId: place.placeId }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Something went wrong");
                return;
            }
            setResult({ reviewLink: json.reviewLink, businessName: json.businessName, emailSent: json.emailSent });
            trackToolUsed("review-link-generator");
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
                    <h1 className="text-[length:var(--fs-display)] font-semibold mt-4 mb-3">Google Review Link Generator</h1>
                    <p className="text-muted-foreground">
                        Find your business and get a direct Google review link immediately. Email is optional.
                    </p>
                </div>
            </section>
            <section className="py-10 px-4 bg-muted/20 border-b border-border">
                <div className="container mx-auto max-w-2xl space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Why a direct review link matters</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        A direct &quot;Write a review&quot; link removes a step for customers who want to leave honest
                        feedback. They can tap once instead of searching for your business on Maps.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Use this free generator to find your listing and copy its review link. For automated SMS
                        and email campaigns after every visit, see Zyene Reviews review collection tools.
                    </p>
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-2xl">
                    <form onSubmit={submit} className="space-y-6 bg-card border border-border rounded-2xl p-6 md:p-8">
                        <div>
                            <label htmlFor="review-link-business" className="text-sm font-medium mb-2 block">Your business</label>
                            <PlaceSearchInput id="review-link-business" onSelect={setPlace} />
                        </div>
                        <div>
                            <label htmlFor="review-link-email" className="text-sm font-medium mb-2 block">Email me a copy (optional)</label>
                            <input
                                id="review-link-email"
                                type="email"
                                autoComplete="email"
                                aria-describedby="review-link-email-disclosure"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 rounded-lg border border-border px-4 text-sm"
                                placeholder="you@business.com"
                            />
                            <div className="mt-2"><FreeToolEmailDisclosure id="review-link-email-disclosure" /></div>
                        </div>
                        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                        {result && (
                            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
                                <p className="font-medium text-foreground mb-2">
                                    Link for {result.businessName}{result.emailSent ? " (email accepted for delivery)" : ""}:
                                </p>
                                <a href={result.reviewLink} className="text-primary break-all underline" target="_blank" rel="noopener noreferrer">
                                    {result.reviewLink}
                                </a>
                                <CopyResultButton text={result.reviewLink} />
                            </div>
                        )}
                        <Button type="submit" disabled={loading} aria-busy={loading} className="w-full" data-track="tool" data-track-location="review-link-generator">
                            {loading ? <FreeToolLoadingLabel text="Finding your review link" /> : "Get my review link"}
                        </Button>
                    </form>
                    {result && (
                        <div className="mt-6">
                            <FreeToolResultCta
                                toolSlug="review-link-generator"
                                message="Send this link automatically by SMS and email after every visit with Zyene Reviews."
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
