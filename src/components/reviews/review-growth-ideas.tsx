"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Mail, Nfc, Sparkles, Upload, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NfcOrderDialog } from "@/components/dashboard/nfc-order-dialog";
import { useNfcOrder } from "@/components/dashboard/use-nfc-order";

const DISMISS_KEY = "reviews-growth-ideas-dismissed";

const subscribe = (onChange: () => void) => {
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
};
const readDismissed = () => {
    try { return localStorage.getItem(DISMISS_KEY) === "true"; } catch { return false; }
};
/** Hidden during server render so dismissed owners never see a flash of the card. */
const serverDismissed = () => true;

type Idea = { icon: LucideIcon; title: string; text: string; cta: string } & ({ href: string } | { onClick: () => void });

function IdeaCard({ idea }: { idea: Idea }) {
    const Icon = idea.icon;
    return (
        <li className="flex min-w-0 flex-col rounded-lg border border-border bg-background p-4">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                {idea.title}
            </span>
            <p className="mt-1.5 flex-1 text-xs leading-5 text-muted-foreground">{idea.text}</p>
            <div className="mt-3">
                {"href" in idea ? (
                    <Button asChild size="sm" variant="outline"><Link href={idea.href}>{idea.cta}</Link></Button>
                ) : (
                    <Button size="sm" variant="outline" onClick={idea.onClick}>{idea.cta}</Button>
                )}
            </div>
        </li>
    );
}

/** Three practical ways to get more reviews, each one click from being set up. Dismissible per browser. */
export function ReviewGrowthIdeas({ businessName }: { businessName: string }) {
    const order = useNfcOrder();
    const storedDismissed = useSyncExternalStore(subscribe, readDismissed, serverDismissed);
    const [hiddenNow, setHiddenNow] = useState(false);

    if (storedDismissed || hiddenNow) return null;

    const dismiss = () => {
        setHiddenNow(true);
        try { localStorage.setItem(DISMISS_KEY, "true"); } catch { /* private mode: hide for this visit only */ }
    };

    const ideas: Idea[] = [
        { icon: Upload, title: "Upload your past customers", cta: "Import a list", href: "/customers?import=1",
            text: "Add a spreadsheet of past customers. We invite a few each day by text or email so nobody gets flooded." },
        { icon: Mail, title: "Sign up customers from invoices", cta: "Set it up", href: "/automations#invoice-enrollment",
            text: "Copy us on the invoice or receipt emails you already send, and each customer is asked for a review." },
        { icon: Nfc, title: "Get a tap-to-review card", cta: "Order a card", onClick: () => order.setOpen(true),
            text: "Customers tap their phone on the card at the counter or table and land on your review page." },
    ];

    return (
        <section aria-labelledby="review-growth-ideas-title" className="rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <h2 id="review-growth-ideas-title" className="ui-section-title flex items-center gap-2 text-foreground">
                    <Sparkles className="size-4 text-primary" aria-hidden />Ideas to get more reviews
                </h2>
                <button type="button" onClick={dismiss} aria-label="Hide these ideas"
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                    <X className="size-4" />
                </button>
            </div>
            <ul className="mt-3 grid gap-3 md:grid-cols-3">
                {ideas.map((idea) => <IdeaCard key={idea.title} idea={idea} />)}
            </ul>
            <NfcOrderDialog businessName={businessName} order={order} />
        </section>
    );
}
