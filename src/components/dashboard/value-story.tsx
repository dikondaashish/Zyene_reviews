"use client";

import type { ReactNode } from "react";
import { Equal, PartyPopper, Star, TrendingUp, Wallet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AverageSale, ReviewValue } from "@/lib/dashboard/review-value";
import { AverageSaleEditor } from "@/components/dashboard/average-sale-editor";

const fmt = (n: number) => n.toLocaleString("en-US");
const usd = (n: number, cents = n < 100) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

/** One term of the equation. The colour carries meaning: what you paid, reviews, your number, the result. */
function Term({ label, tone, tint, icon, children }: { label: string; tone: string; tint: string; icon: ReactNode; children: ReactNode }) {
    return (
        <div className={cn("min-w-0 rounded-xl px-3.5 py-3 sm:flex-1", tint)}>
            <p className={cn("flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide", tone)}>
                {icon}{label}
            </p>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{children}</div>
        </div>
    );
}

function Op({ children }: { children: ReactNode }) {
    return <span className="hidden size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground sm:flex" aria-hidden>{children}</span>;
}

/**
 * "You paid $X, got N reviews, each worth about your average sale, so roughly $Y of new
 * business." Reads left to right as an equation so the value lands before anything else.
 */
export function ValueStory({
    businessId,
    newReviews,
    monthlyPrice,
    averageSale,
    reviewValue,
}: {
    businessId: string;
    newReviews: number;
    monthlyPrice: number | null;
    averageSale: AverageSale;
    reviewValue: ReviewValue;
}) {
    const multiple = reviewValue.returnMultiple;
    const verdict =
        newReviews === 0
            ? `Each new review is worth about ${usd(reviewValue.perReviewUsd)} to your business. Your next one is a share away.`
            : multiple !== null
              ? multiple >= 1
                  ? `That's ${multiple >= 10 ? fmt(Math.round(multiple)) : multiple.toFixed(1)}× what you paid for Zyene this month.`
                  : `Already ${Math.round(multiple * 100)}% of your plan paid back. A couple more reviews covers it.`
              : monthlyPrice === 0
                ? "All of it during your free trial."
                : null;

    return (
        <div className="rounded-xl border border-border bg-card p-2.5 sm:p-3">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch sm:gap-2 [&>span]:self-center">
                {monthlyPrice !== null && (
                    <>
                        <Term label="You paid" tone="text-primary" tint="bg-primary/10" icon={<Wallet className="size-3.5" aria-hidden />}>
                            {usd(monthlyPrice, true)}<span className="text-sm font-medium text-muted-foreground">/mo</span>
                        </Term>
                        <Op><span className="text-xs font-semibold">→</span></Op>
                    </>
                )}
                <Term label="New reviews" tone="text-warning-foreground" tint="bg-chart-4/20" icon={<Star className="size-3.5 fill-warning text-warning" aria-hidden />}>
                    {fmt(newReviews)}
                </Term>
                <Op><X className="size-3.5" /></Op>
                <Term label="Your average sale" tone="text-chart-5" tint="bg-chart-5/10" icon={<span className="size-2 rounded-full bg-chart-5" aria-hidden />}>
                    <AverageSaleEditor businessId={businessId} averageSale={averageSale} />
                </Term>
                <Op><Equal className="size-3.5" /></Op>
                <Term label="New business" tone="text-success" tint="bg-chart-2/20 ring-1 ring-chart-2/40" icon={<TrendingUp className="size-3.5" aria-hidden />}>
                    <span className="whitespace-nowrap text-success">≈ {usd(reviewValue.valueUsd)}</span>
                </Term>
            </div>
            {verdict && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground sm:text-base">
                    <PartyPopper className="size-4 shrink-0 sm:size-5" aria-hidden />
                    {verdict}
                </p>
            )}
        </div>
    );
}
