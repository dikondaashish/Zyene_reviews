"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyResultButton } from "@/components/marketing/free-tools/copy-result-button";
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
            setBonusSent(Boolean(json.bonusSent));
            if (!json.bonusSent) setError("Email could not be sent. Your editable draft is still available below.");
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
                        Choose a rating to build a template-based reply. Edit it for the customer’s specific feedback, then copy it. Email is optional.
                    </p>
                </div>
            </section>
            <section className="py-10 px-4 bg-muted/20 border-b border-border">
                <div className="container mx-auto max-w-2xl space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Respond professionally to every review</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Replying to Google reviews shows customers how you handle feedback. Google does not publish
                        response rate as a separate ranking factor. This free tool selects a reusable template by rating; it does not analyze the meaning of the review text.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        To draft replies or automatically publish responses to eligible new Google reviews, use
                        <Link href="/features/ai-replies" className="font-semibold underline underline-offset-4">Zyene’s AI drafts and automatic Google replies</Link> on eligible paid plans with a 7-day free trial.
                    </p>
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-2xl space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
                        <input
                            aria-label="Business name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Your business name"
                            className="w-full h-11 rounded-lg border border-border px-4 text-sm"
                        />
                        <div>
                            <label className="text-sm font-medium mb-2 block">Star rating</label>
                            <select
                                aria-label="Star rating"
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
                            aria-label="Customer review"
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
                            <label htmlFor="editable-reply" className="text-sm font-medium mb-2 block">Edit your template reply</label>
                            <textarea id="editable-reply" value={response} onChange={(e) => setResponse(e.target.value)} rows={6} className="w-full rounded-lg border border-border bg-background p-3 text-sm" />
                            <CopyResultButton text={response} />
                        </div>
                    )}
                    {response && !bonusSent && (
                        <form onSubmit={sendBonus} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                            <p className="text-sm font-medium">Get 5 more templates by email</p>
                            <input
                                type="email"
                                aria-label="Email address"
                                autoComplete="email"
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
                    {bonusSent && <p className="text-sm text-success text-center">Bonus templates accepted for email delivery.</p>}
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                </div>
            </section>
        </div>
    );
}
