"use client";

import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

interface DemoFormProps {
    slot: string;
    timeZone: string;
    sessionId: string;
    pagePath?: string;
    defaultName: string;
    defaultEmail: string;
    onBooked: (name: string, email: string) => void;
}

export function SupportChatDemoForm({ slot, timeZone, sessionId, pagePath, defaultName, defaultEmail, onBooked }: DemoFormProps) {
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") ?? "").trim();
        const email = String(form.get("email") ?? "").trim();
        setSending(true);
        setError(null);
        try {
            const res = await fetch("/api/marketing/chat/demo-book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, start: slot, timeZone, name, email, pagePath }),
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) throw new Error(data.error ?? "Couldn't book that time.");
            onBooked(name, email);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't book that time.");
            setSending(false);
        }
    };

    return (
        <form className="support-chat-demo-form" onSubmit={onSubmit}>
            <input name="name" autoComplete="name" required maxLength={120} defaultValue={defaultName} placeholder="Your name" aria-label="Your name" />
            <input name="email" type="email" autoComplete="email" required maxLength={320} defaultValue={defaultEmail} placeholder="Work email" aria-label="Work email" />
            {error ? <p className="support-chat-card__error" role="alert">{error}</p> : null}
            <button type="submit" className="support-chat-lead__submit" disabled={sending}>
                {sending ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : null}
                Confirm demo
            </button>
        </form>
    );
}
