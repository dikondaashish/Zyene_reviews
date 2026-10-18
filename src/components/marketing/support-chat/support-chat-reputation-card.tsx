"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { SupportChatReputationResult } from "@/components/marketing/support-chat/support-chat-reputation-result";
import type { StoredChatMessage } from "@/lib/support-chat/client-storage";
import type { ReputationCheckResult } from "@/lib/support-chat/tools/reputation-check";

interface Suggestion {
    placeId: string;
    primaryText: string;
    secondaryText: string;
}

interface ReputationCardProps {
    message: StoredChatMessage;
    sessionId: string;
    onResolve: (id: string, result: StoredChatMessage["widgetResult"], summary?: string) => void;
}

export function SupportChatReputationCard({ message, sessionId, onResolve }: ReputationCardProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    /** Query the current suggestions belong to; drives the "no matches" hint. */
    const [searchedFor, setSearchedFor] = useState("");
    const [status, setStatus] = useState<"idle" | "checking">("idle");
    const [error, setError] = useState<string | null>(null);
    const result = message.widgetResult?.reputation;

    useEffect(() => {
        const q = query.trim();
        if (q.length < 3 || result) return;
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const res = await fetch(`/api/marketing/tools/places-search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
                const data = (await res.json()) as { suggestions?: Suggestion[] };
                setSuggestions((data.suggestions ?? []).slice(0, 5));
                setSearchedFor(q);
            } catch {
                // Aborted by the next keystroke, or offline; the list just doesn't update.
            }
        }, 300);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [query, result]);

    if (result) return <SupportChatReputationResult result={result} />;

    const check = async (place: Suggestion) => {
        setStatus("checking");
        setError(null);
        setSuggestions([]);
        setQuery(place.primaryText);
        try {
            const res = await fetch("/api/marketing/chat/reputation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, placeId: place.placeId }),
            });
            const data = (await res.json()) as { result?: ReputationCheckResult; summary?: string; error?: string };
            if (!res.ok || !data.result) throw new Error(data.error ?? "I couldn't check that business right now.");
            onResolve(message.id, { reputation: data.result }, data.summary);
        } catch (err) {
            setError(err instanceof Error ? err.message : "I couldn't check that business right now.");
            setStatus("idle");
        }
    };

    return (
        <div className="support-chat-card" aria-label="Check your Google rating">
            <p className="support-chat-card__title">Check your Google rating</p>
            <p className="support-chat-card__hint">Search for your business to see your rating and how you compare nearby.</p>
            <label className="support-chat-search">
                {status === "checking" ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Search size={15} aria-hidden="true" />}
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="e.g. Juniper Coffee, Austin"
                    aria-label="Business name"
                    autoComplete="off"
                    maxLength={120}
                    disabled={status === "checking"}
                />
            </label>
            {suggestions.length ? (
                <ul className="support-chat-suggest" role="listbox" aria-label="Matching businesses">
                    {suggestions.map((s) => (
                        <li key={s.placeId}>
                            <button type="button" role="option" aria-selected="false" onClick={() => void check(s)}>
                                <strong>{s.primaryText}</strong>
                                <span>{s.secondaryText}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
            {!suggestions.length && status === "idle" && searchedFor && searchedFor === query.trim() ? (
                <p className="support-chat-card__hint">No matches yet. Try adding your city or street.</p>
            ) : null}
            {error ? <p className="support-chat-card__error" role="alert">{error}</p> : null}
        </div>
    );
}
