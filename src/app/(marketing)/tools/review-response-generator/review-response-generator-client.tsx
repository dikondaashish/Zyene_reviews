"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyResultButton } from "@/components/marketing/free-tools/copy-result-button";
import { FreeToolEmailDisclosure } from "@/components/marketing/free-tools/free-tool-email-disclosure";
import { FreeToolLoadingLabel } from "@/components/marketing/free-tools/free-tool-loading-label";
import { FreeToolResultCta } from "@/components/marketing/free-tools/free-tool-result-cta";
import { trackToolUsed } from "@/lib/free-tools/track-tool-used";

const TOOL = "review-response-generator";
const fieldClass = "w-full h-11 rounded-lg border border-border px-4 text-sm bg-background";

export function ReviewResponseGeneratorClient() {
    const [rating, setRating] = useState(5);
    const [businessName, setBusinessName] = useState("");
    const [response, setResponse] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [bonusSent, setBonusSent] = useState(false);
    const [error, setError] = useState("");

    async function request(extra: { email?: string; sendBonus: boolean }) {
        const res = await fetch("/api/marketing/tools/review-response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, businessName, ...extra }),
        });
        return { res, json: await res.json() };
    }

    async function generate() {
        setLoading(true);
        setError("");
        try {
            const { res, json } = await request({ sendBonus: false });
            if (!res.ok) return setError(json.error ?? "Failed");
            setResponse(json.response);
            trackToolUsed(TOOL);
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }

    async function sendBonus(e: React.FormEvent) {
        e.preventDefault();
        if (!response) await generate();
        setLoading(true);
        setError("");
        try {
            const { res, json } = await request({ email, sendBonus: true });
            if (!res.ok) return setError(json.error ?? "Failed");
            setBonusSent(Boolean(json.bonusSent));
            trackToolUsed(TOOL);
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
                    <h1 className="text-[length:var(--fs-display)] font-semibold mt-4 mb-3">Review Response Templates</h1>
                    <p className="text-muted-foreground">
                        Pick a star rating, get a ready-to-edit reply template. Edit it for the customer’s specific feedback, then copy it. Email is optional.
                    </p>
                </div>
            </section>
            <section className="py-10 px-4 bg-muted/20 border-b border-border">
                <div className="container mx-auto max-w-2xl space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Respond professionally to every review</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Replying to Google reviews shows customers how you handle feedback. Google does not publish
                        response rate as a separate ranking factor. This free tool picks a reusable template by star rating. It does not read or analyze the review itself.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        To draft replies or automatically publish responses to eligible new Google reviews, use{" "}
                        <Link href="/features/ai-replies" className="font-semibold underline underline-offset-4">Zyene’s AI drafts and automatic Google replies</Link> on eligible paid plans with a 7-day free trial.
                    </p>
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="container mx-auto max-w-2xl space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4">
                        <div>
                            <label htmlFor="response-business-name" className="text-sm font-medium mb-2 block">Business name (optional)</label>
                            <input id="response-business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your business name" autoComplete="organization" className={fieldClass} />
                        </div>
                        <div>
                            <label htmlFor="response-star-rating" className="text-sm font-medium mb-2 block">Star rating</label>
                            <select id="response-star-rating" value={rating} onChange={(e) => setRating(Number(e.target.value))} className={fieldClass}>
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>{n} {n === 1 ? "star" : "stars"}</option>
                                ))}
                            </select>
                        </div>
                        <Button type="button" onClick={generate} disabled={loading} aria-busy={loading} className="w-full" data-track="tool" data-track-location={TOOL}>
                            {loading ? <FreeToolLoadingLabel text="Getting your template" /> : "Get reply template"}
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
                            <label htmlFor="response-bonus-email" className="text-sm font-medium block">Get 5 more templates by email</label>
                            <input id="response-bonus-email" type="email" autoComplete="email" required aria-describedby="response-bonus-disclosure" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className={fieldClass} />
                            <FreeToolEmailDisclosure id="response-bonus-disclosure" />
                            <Button type="submit" disabled={loading} aria-busy={loading} className="w-full" data-track="tool" data-track-location={TOOL}>
                                {loading ? <FreeToolLoadingLabel text="Sending templates" /> : "Email bonus templates"}
                            </Button>
                        </form>
                    )}
                    {bonusSent && <p role="status" className="text-sm text-success text-center">Bonus templates accepted for email delivery.</p>}
                    {error && <p role="alert" className="text-sm text-destructive text-center">{error}</p>}
                    {response && (
                        <FreeToolResultCta toolSlug={TOOL} message="Want a reply drafted for each new review? Zyene Reviews drafts them for you on paid plans." />
                    )}
                </div>
            </section>
        </div>
    );
}
