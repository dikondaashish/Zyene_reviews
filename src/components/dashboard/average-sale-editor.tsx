"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import type { AverageSale } from "@/lib/dashboard/review-value";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0 });

/** The owner's own number makes the estimate believable, so it is editable right where it is used. */
export function AverageSaleEditor({ businessId, averageSale }: { businessId: string; averageSale: AverageSale }) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(averageSale.usd));
    const [pending, startTransition] = useTransition();

    const save = (event: FormEvent) => {
        event.preventDefault();
        const dollars = Number(draft.replace(/[$,\s]/g, ""));
        if (!Number.isFinite(dollars) || dollars <= 0 || dollars > 1_000_000) {
            toast.error("Enter your average sale in dollars, like 75");
            return;
        }
        startTransition(async () => {
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ average_sale_cents: Math.round(dollars * 100) }),
            });
            if (!response.ok) {
                toast.error(response.status === 403 ? "Only owners and managers can change this" : "Could not save your average sale");
                return;
            }
            setEditing(false);
            toast.success("Saved. Your review value now uses your number.");
            router.refresh();
        });
    };

    if (!editing) {
        return (
            <button
                type="button"
                onClick={() => { setDraft(String(averageSale.usd)); setEditing(true); }}
                className="group inline-flex items-center gap-1 rounded-md font-semibold text-chart-5 underline decoration-chart-5/40 decoration-dashed underline-offset-4 transition-colors hover:decoration-chart-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={`Average sale ${usd(averageSale.usd)}. Edit`}
            >
                {usd(averageSale.usd)}
                <Pencil className="size-3 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
            </button>
        );
    }

    return (
        <form onSubmit={save} className="inline-flex items-center gap-1 align-middle">
            <span className="text-muted-foreground" aria-hidden>$</span>
            <input
                autoFocus
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
                disabled={pending}
                aria-label="Your average sale per customer, in dollars"
                className="h-7 w-16 rounded-md border border-input bg-background px-1.5 text-sm font-semibold tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            />
            <button type="submit" disabled={pending} aria-label="Save average sale" className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                <Check className="size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={pending} aria-label="Cancel" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
                <X className="size-4" aria-hidden />
            </button>
        </form>
    );
}
