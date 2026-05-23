"use client";

import * as React from "react";
import type { Database } from "@/lib/db/supabase/database.types";

export type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

export function parseFullName(input: string): { first_name: string | null; last_name: string | null } {
    const t = input.trim();
    if (!t) return { first_name: null, last_name: null };
    const i = t.indexOf(" ");
    if (i === -1) return { first_name: t, last_name: null };
    const rest = t.slice(i + 1).trim();
    return { first_name: t.slice(0, i), last_name: rest || null };
}

export function displayName(c: CustomerRow): string {
    return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
}

export function initials(c: CustomerRow): string {
    const name = displayName(c);
    if (name) {
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].slice(0, 2).toUpperCase();
    }
    const digits = (c.phone ?? "").replace(/\D/g, "");
    if (digits.length >= 4) return digits.slice(-4);
    if (digits.length > 0) return digits.slice(-2);
    const email = (c.email ?? "").trim();
    if (email.length >= 2) {
        const local = email.split("@")[0] ?? email;
        const letters = local.replace(/[^a-zA-Z0-9]/g, "");
        if (letters.length >= 2) return letters.slice(0, 2).toUpperCase();
        return email.slice(0, 2).toUpperCase();
    }
    return "?";
}

export function channelLabel(ch: string): string {
    const x = ch.toLowerCase();
    if (x === "sms") return "SMS";
    if (x === "email") return "Email";
    if (x === "link") return "Link";
    return ch;
}

export function platformLabel(p: string): string {
    const x = p.toLowerCase();
    if (x === "google") return "Google";
    if (x === "facebook") return "Facebook";
    if (x === "yelp") return "Yelp";
    return p.charAt(0).toUpperCase() + p.slice(1);
}

export function requestStatusTone(status: string): { className: string; dot: string } {
    const s = status.toLowerCase();
    if (s === "failed" || s === "skipped")
        return {
            className: "border-destructive/30 bg-destructive/10 text-destructive",
            dot: "bg-destructive",
        };
    if (s === "sending" || s === "queued" || s === "pending")
        return {
            className: "border-chart-4/35 bg-chart-4/10 text-chart-4",
            dot: "bg-chart-4 animate-pulse",
        };
    if (s === "sent" || s === "delivered" || s === "opened" || s === "clicked" || s === "completed" || s === "review_left")
        return {
            className: "border-chart-2/35 bg-chart-2/10 text-chart-2",
            dot: "bg-chart-2",
        };
    return {
        className: "border-border bg-muted/60 text-muted-foreground",
        dot: "bg-muted-foreground",
    };
}

export function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </span>
                    {title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
