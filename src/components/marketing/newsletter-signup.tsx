"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { deserializeUtm, UTM_COOKIE_NAME } from "@/lib/growth/utm";

function readUtmCookie() {
    if (typeof document === "undefined") return {};
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${UTM_COOKIE_NAME}=`));
    if (!match) return {};
    const parsed = deserializeUtm(decodeURIComponent(match.split("=").slice(1).join("=")));
    return {
        utm_source: parsed?.utm_source,
        utm_medium: parsed?.utm_medium,
        utm_campaign: parsed?.utm_campaign,
    };
}

export function NewsletterSignup({
    source = "newsletter",
    className = "",
}: {
    source?: string;
    className?: string;
}) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/marketing/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), source, ...readUtmCookie() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setStatus("error");
                setMessage(data.error ?? "Something went wrong. Please try again.");
                return;
            }
            setStatus("success");
            setMessage("You're subscribed. Check your inbox for a confirmation.");
            setEmail("");
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    }

    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={status === "loading" || status === "success"}
                    className="flex-1 h-11 rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
                <Button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="h-11 px-6 rounded-lg shrink-0"
                >
                    {status === "loading" ? (
                        <Loader2 className="animate-spin size-4" />
                    ) : status === "success" ? (
                        "Subscribed"
                    ) : (
                        "Subscribe"
                    )}
                </Button>
            </form>
            {message && (
                <p
                    className={`text-xs mt-3 text-center ${status === "error" ? "text-destructive" : "text-primary"}`}
                >
                    {message}
                </p>
            )}
            {status !== "success" && (
                <p className="text-xs text-muted-foreground mt-3 text-center">No spam. Unsubscribe anytime.</p>
            )}
        </div>
    );
}
