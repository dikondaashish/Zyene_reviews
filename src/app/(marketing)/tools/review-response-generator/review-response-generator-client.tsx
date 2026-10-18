"use client";

import { useState } from "react";
import Link from "next/link";
import { FreeToolShell } from "@/components/marketing/free-tools/free-tool-shell";
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
        <FreeToolShell
            title="Review Response Templates"
            lede="Pick a star rating, get a ready-to-edit reply template. Edit it for the customer’s specific feedback, then copy it. Email is optional."
            whyTitle="Respond professionally to every review"
            why={<>
                <p>
                        Replying to Google reviews shows customers how you handle feedback. Google does not publish
                        response rate as a separate ranking factor. This free tool picks a reusable template by star rating. It does not read or analyze the review itself.
                    </p>
                    <p>
                        To draft replies or automatically publish responses to eligible new Google reviews, use{" "}
                        <Link href="/features/ai-replies" className="mi-inline-link">Zyene’s AI drafts and automatic Google replies</Link> on eligible paid plans with a 7-day free trial.
                    </p>
            </>}
        >
<div className="mi-panel tool-form">
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
                        <button type="button" onClick={generate} disabled={loading} aria-busy={loading} className="marketing-button w-full disabled:pointer-events-none disabled:opacity-60" data-track="tool" data-track-location={TOOL}>
                            {loading ? <FreeToolLoadingLabel text="Getting your template" /> : "Get reply template"}
                        </button>
                    </div>
                    {response && (
                        <div className="mi-panel tool-form">
                            <label htmlFor="editable-reply" className="text-sm font-medium mb-2 block">Edit your template reply</label>
                            <textarea id="editable-reply" value={response} onChange={(e) => setResponse(e.target.value)} rows={6} className="w-full rounded-lg border border-border bg-background p-3 text-sm" />
                            <CopyResultButton text={response} />
                        </div>
                    )}
                    {response && !bonusSent && (
                        <form onSubmit={sendBonus} className="mi-panel tool-form">
                            <label htmlFor="response-bonus-email" className="text-sm font-medium block">Get 5 more templates by email</label>
                            <input id="response-bonus-email" type="email" autoComplete="email" required aria-describedby="response-bonus-disclosure" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" className={fieldClass} />
                            <FreeToolEmailDisclosure id="response-bonus-disclosure" />
                            <button type="submit" disabled={loading} aria-busy={loading} className="marketing-button marketing-button-secondary w-full disabled:pointer-events-none disabled:opacity-60" data-track="tool" data-track-location={TOOL}>
                                {loading ? <FreeToolLoadingLabel text="Sending templates" /> : "Email bonus templates"}
                            </button>
                        </form>
                    )}
                    {bonusSent && <p role="status" className="text-sm text-success text-center">Bonus templates accepted for email delivery.</p>}
                    {error && <p role="alert" className="text-sm text-destructive text-center">{error}</p>}
                    {response && (
                        <FreeToolResultCta toolSlug={TOOL} message="Want a reply drafted for each new review? Zyene Reviews drafts them for you on paid plans." />
                    )}
        </FreeToolShell>
    );
}
