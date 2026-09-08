"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, Loader2, Sparkles, X } from "lucide-react";

const SEEN_KEY = "zyene-home-book-wizard-seen";
const INDUSTRIES = ["Restaurant or cafe", "Healthcare", "Home services", "Other local business"];
const GOALS = ["Get more reviews", "Reply faster", "Protect my rating", "Build one workflow"];

function storageHasSeen() {
    try {
        return window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
        return false;
    }
}

export function HomeLeadWizard() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [industry, setIndustry] = useState("");
    const [goal, setGoal] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previewWizard = process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).get("qa") === "wizard";
        if (!previewWizard && process.env.NODE_ENV !== "production") return;
        if (!previewWizard && storageHasSeen()) return;
        if (previewWizard) {
            const previewTimer = window.setTimeout(() => setOpen(true), 0);
            return () => window.clearTimeout(previewTimer);
        }
        const timer = window.setTimeout(() => {
            try {
                window.localStorage.setItem(SEEN_KEY, "1");
            } catch {
                // The wizard still works when storage is unavailable.
            }
            setOpen(true);
        }, 12000);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status === "loading") return;
        setStatus("loading");
        setMessage("");
        try {
            const response = await fetch("/api/marketing/book-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), industry, goal }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setStatus("error");
                setMessage(data.error ?? "Something went wrong. Please try again.");
                return;
            }
            setDownloadUrl(data.downloadUrl ?? "/zyene-overview.pdf");
            setEmailSent(data.emailSent === true);
            setStatus("success");
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    }

    if (!open) return null;

    return (
        <div
            className="home-lead-wizard-backdrop"
            data-home-lead-wizard
            data-state={status}
            onClick={(event) => event.target === event.currentTarget && setOpen(false)}
        >
            <div className="home-lead-wizard" role="dialog" aria-modal="true" aria-labelledby="home-lead-wizard-title">
                <button ref={closeRef} type="button" className="home-lead-wizard-close" aria-label="Close guide offer" onClick={() => setOpen(false)}>
                    <X size={20} aria-hidden="true" />
                </button>
                <div className="home-lead-wizard-visual">
                    <div className="home-lead-wizard-visual-glow" />
                    <div className="home-lead-wizard-book">
                        <Image src="/marketing/home/zyene-overview-cover.png" alt="Zyene Reviews Enterprise Reputation Management guide" fill sizes="(max-width: 680px) 70vw, 360px" priority />
                    </div>
                    <span className="home-lead-wizard-sticker"><Sparkles size={14} aria-hidden="true" /> Free guide</span>
                    <p className="home-lead-wizard-visual-note">Turn customer feedback into regional growth.</p>
                </div>
                <div className="home-lead-wizard-content">
                    <div className="home-lead-wizard-progress" aria-label={`Step ${step} of 2`}><span style={{ width: step === 1 ? "50%" : "100%" }} /></div>
                    {status === "success" ? (
                        <div className="home-lead-wizard-step" key="success">
                            <div className="home-lead-wizard-success-icon"><Check size={22} aria-hidden="true" /></div>
                            <p className="home-lead-wizard-kicker">You’re all set</p>
                            <h2 id="home-lead-wizard-title">Your guide is ready.</h2>
                            <p className="home-lead-wizard-description">{emailSent ? "We also sent a copy to your inbox. " : ""}Download it now and start building a stronger review workflow.</p>
                            <a className="home-lead-wizard-primary" href={downloadUrl} download="zyene-reviews-guide.pdf">Download the guide <ArrowRight size={17} aria-hidden="true" /></a>
                            <button type="button" className="home-lead-wizard-text-button" onClick={() => setOpen(false)}>Continue browsing</button>
                        </div>
                    ) : step === 1 ? (
                        <div className="home-lead-wizard-step" key="step-one">
                            <p className="home-lead-wizard-kicker"><BookOpen size={16} aria-hidden="true" /> A practical guide for local businesses</p>
                            <h2 id="home-lead-wizard-title">Build a reputation that brings people back.</h2>
                            <p className="home-lead-wizard-description">Tell us what you’re working on and we’ll send the Zyene Reviews guide with the most useful starting points.</p>
                            <fieldset><legend>What kind of business do you run?</legend><div className="home-lead-wizard-options">{INDUSTRIES.map((option) => <button key={option} type="button" aria-pressed={industry === option} className={industry === option ? "is-selected" : ""} onClick={() => setIndustry(option)}>{option}</button>)}</div></fieldset>
                            <fieldset><legend>What would help most right now?</legend><div className="home-lead-wizard-options">{GOALS.map((option) => <button key={option} type="button" aria-pressed={goal === option} className={goal === option ? "is-selected" : ""} onClick={() => setGoal(option)}>{option}</button>)}</div></fieldset>
                            <button type="button" className="home-lead-wizard-primary" disabled={!industry || !goal} onClick={() => setStep(2)}>Next step <ArrowRight size={17} aria-hidden="true" /></button>
                        </div>
                    ) : (
                        <form className="home-lead-wizard-step" key="step-two" onSubmit={handleSubmit}>
                            <p className="home-lead-wizard-kicker"><Sparkles size={16} aria-hidden="true" /> One useful download, straight to you</p>
                            <h2 id="home-lead-wizard-title">Where should we send your guide?</h2>
                            <p className="home-lead-wizard-description">Enter your email to unlock the Zyene Reviews Enterprise Reputation Management guide.</p>
                            <label htmlFor="home-lead-wizard-email">Email address</label>
                            <input id="home-lead-wizard-email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourbusiness.com" disabled={status === "loading"} />
                            {message ? <p className="home-lead-wizard-error" role="alert">{message}</p> : null}
                            <button type="submit" className="home-lead-wizard-primary" disabled={status === "loading"}>{status === "loading" ? <><Loader2 size={17} className="home-lead-wizard-spin" aria-hidden="true" /> Saving your guide…</> : <>Get the free guide <ArrowRight size={17} aria-hidden="true" /></>}</button>
                            <button type="button" className="home-lead-wizard-text-button" onClick={() => setStep(1)}>Back to questions</button>
                            <p className="home-lead-wizard-privacy">No spam. Just the guide and occasional practical review tips. Unsubscribe anytime.</p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
