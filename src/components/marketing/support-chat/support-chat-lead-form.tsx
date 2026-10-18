"use client";

import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { LeadReason } from "@/hooks/use-support-chat";
import type { StoredChatMessage } from "@/lib/support-chat/client-storage";
import { BUSINESS_TYPES } from "@/lib/support-chat/constants";

interface LeadFormProps {
    reason: LeadReason;
    sessionId: string;
    defaultEmail: string;
    pagePath?: string;
    transcript: StoredChatMessage[];
    onSubmitted: (name: string, email: string) => void;
    onDismiss: () => void;
}

const COPY: Record<LeadReason, { title: string; body: string }> = {
    question_limit: {
        title: "Let's keep this going",
        body: "Share a few details so the team can follow up, then keep asking as much as you like.",
    },
    human_request: {
        title: "Talk to a person",
        body: "Leave your details and someone from the team will reach out, usually within one business day.",
    },
};

export function SupportChatLeadForm({ reason, sessionId, defaultEmail, pagePath, transcript, onSubmitted, onDismiss }: LeadFormProps) {
    const [status, setStatus] = useState<"idle" | "sending">("idle");
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const value = (key: string) => String(form.get(key) ?? "").trim();
        setStatus("sending");
        setError(null);
        try {
            const res = await fetch("/api/marketing/chat/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    reason,
                    pagePath,
                    name: value("name"),
                    email: value("email"),
                    phone: value("phone"),
                    businessType: value("businessType"),
                    company: value("company"),
                    transcript: transcript.slice(-40).map(({ role, content }) => ({ role, content })),
                }),
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok && res.status !== 429) throw new Error(data.error ?? "Unable to save your details.");
            onSubmitted(value("name"), value("email"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to save your details.");
            setStatus("idle");
        }
    };

    const copy = COPY[reason];
    return (
        <form className="support-chat-lead" onSubmit={onSubmit} aria-labelledby="support-chat-lead-title">
            <h3 id="support-chat-lead-title">{copy.title}</h3>
            <p>{copy.body}</p>
            <label>
                <span>Name</span>
                <input name="name" autoComplete="name" required maxLength={120} placeholder="Jane Smith" />
            </label>
            <label>
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" required maxLength={320} defaultValue={defaultEmail} placeholder="jane@business.com" />
            </label>
            <label>
                <span>Phone</span>
                <input name="phone" type="tel" autoComplete="tel" required maxLength={40} pattern="[+()\d\s.\-]{7,}" placeholder="(555) 123-4567" />
            </label>
            <label>
                <span>Type of business</span>
                <select name="businessType" required defaultValue="">
                    <option value="" disabled>Choose one</option>
                    {BUSINESS_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
            </label>
            <input name="company" className="support-chat-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {error ? <p className="support-chat-lead__error" role="alert">{error}</p> : null}
            <button type="submit" className="support-chat-lead__submit" disabled={status === "sending"}>
                {status === "sending" ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                Send my details
            </button>
            {reason === "human_request" ? (
                <button type="button" className="support-chat-lead__later" onClick={onDismiss}>Not now</button>
            ) : null}
            <p className="support-chat-lead__fine">We only use this to follow up about Zyene Reviews. See our <a href="/privacy">privacy policy</a>.</p>
        </form>
    );
}
