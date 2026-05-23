"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceSearchInput, type PlaceSuggestion } from "@/components/marketing/free-tools/place-search-input";
import { Loader2 } from "lucide-react";

export function ReviewLinkGeneratorClient() {
    const [place, setPlace] = useState<PlaceSuggestion | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ reviewLink: string; businessName: string } | null>(null);
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
            setResult({ reviewLink: json.reviewLink, businessName: json.businessName });
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
                    <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-3">Google Review Link Generator</h1>
                    <p className="text-muted-foreground">
                        Find your business and we&apos;ll email you a direct &quot;Write a review&quot; link for Google Maps.
                    </p>
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-2xl">
                    <form onSubmit={submit} className="space-y-6 bg-card border border-border rounded-2xl p-6 md:p-8">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Your business</label>
                            <PlaceSearchInput onSelect={setPlace} />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Email to receive the link</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 rounded-lg border border-border px-4 text-sm"
                                placeholder="you@business.com"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        {result && (
                            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
                                <p className="font-medium text-foreground mb-2">
                                    Link for {result.businessName} (also sent to your email):
                                </p>
                                <a href={result.reviewLink} className="text-primary break-all underline" target="_blank" rel="noreferrer">
                                    {result.reviewLink}
                                </a>
                            </div>
                        )}
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Loader2 className="animate-spin size-4" /> : "Get my review link"}
                        </Button>
                    </form>
                </div>
            </section>
        </div>
    );
}
