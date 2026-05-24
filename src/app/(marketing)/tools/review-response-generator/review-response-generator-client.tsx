"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ReviewResponseGeneratorClient() {
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [response, setResponse] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [bonusSent, setBonusSent] = useState(false);
    const [error, setError] = useState("");

    async function generate() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/marketing/tools/review-response", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, reviewText, businessName, sendBonus: false }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Failed");
                return;
            }
            setResponse(json.response);
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }

    async function sendBonus(e: React.FormEvent) {
        e.preventDefault();
        if (!response) {
            await generate();
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/marketing/tools/review-response", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    reviewText,
                    businessName,
                    email,
                    sendBonus: true,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error ?? "Failed");
                return;
            }
            setResponse(json.response);
            setBonusSent(true);
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
                    <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-3">Review Response Generator</h1>
                    <p className="text-muted-foreground">
                        Paste a review, pick a star rating, and get a professional draft reply. Email for 5 bonus templates.
                    </p>
                </div>
            </section>
            <section className="py-10 px-4 bg-muted/20 border-b border-border">
                <div className="container mx-auto max-w-2xl space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Respond professionally to every review</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Replying to Google reviews shows future customers you care — and Google factors response rate
                        into local visibility. This generator drafts a professional reply based on the rating and review
                        text you provide.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        For one-click AI replies on every new review, tone control, and optional auto-commenter, use
                        Zyene Reviews AI reply feature on all paid plans with a 7-day free trial.
                    </p>
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-2xl space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
                        <input
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Your business name"
                            className="w-full h-11 rounded-lg border border-border px-4 text-sm"
                        />
                        <div>
                            <label className="text-sm font-medium mb-2 block">Star rating</label>
                            <select
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                                className="w-full h-11 rounded-lg border border-border px-4 text-sm bg-background"
                            >
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>{n} stars</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Paste the customer review here (optional)"
                            rows={4}
                            className="w-full rounded-lg border border-border px-4 py-3 text-sm"
                        />
                        <Button type="button" onClick={generate} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="animate-spin size-4" /> : "Generate response"}
                        </Button>
                    </div>
                    {response && (
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <p className="text-sm font-medium mb-2">Suggested reply</p>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{response}</p>
                        </div>
                    )}
                    {response && !bonusSent && (
                        <form onSubmit={sendBonus} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                            <p className="text-sm font-medium">Get 5 more templates by email</p>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 rounded-lg border border-border px-4 text-sm"
                            />
                            <Button type="submit" disabled={loading} className="w-full">
                                Email bonus templates
                            </Button>
                        </form>
                    )}
                    {bonusSent && <p className="text-sm text-chart-2 text-center">Bonus templates sent to your inbox.</p>}
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                </div>
            </section>
        </div>
    );
}
