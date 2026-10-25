import { PartyPopper } from "lucide-react";
import type { AverageSale, ReviewValue } from "@/lib/dashboard/review-value";
import { AverageSaleEditor } from "@/components/dashboard/average-sale-editor";

const fmt = (n: number) => n.toLocaleString("en-US");
const usd = (n: number, cents = n < 100) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

function verdictFor(newReviews: number, monthlyPrice: number | null, value: ReviewValue): string | null {
    const multiple = value.returnMultiple;
    if (newReviews === 0 || monthlyPrice === null) return null;
    if (monthlyPrice === 0) return "Free during your trial";
    if (multiple === null) return null;
    if (multiple >= 1) return `${multiple >= 10 ? fmt(Math.round(multiple)) : multiple.toFixed(1)}× your ${usd(monthlyPrice, true)} plan`;
    return `${Math.round(multiple * 100)}% of your plan paid back`;
}

/**
 * One number that matters (the estimated new business), the maths behind it in a single
 * sentence with the owner's editable average sale, and how many times over the plan paid off.
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
    const verdict = verdictFor(newReviews, monthlyPrice, reviewValue);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="text-3xl font-semibold tracking-tight tabular-nums text-success sm:text-4xl">
                    {newReviews === 0 ? usd(reviewValue.perReviewUsd, reviewValue.perReviewUsd % 1 !== 0) : `≈ ${usd(reviewValue.valueUsd)}`}
                    <span className="ml-2 text-sm font-medium tracking-normal text-muted-foreground">
                        {newReviews === 0 ? "per new review" : "in new business"}
                    </span>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                    {newReviews === 0 ? "Each review ≈ one customer at your" : (
                        <>
                            <span className="font-semibold text-warning-foreground">{fmt(newReviews)} new reviews</span>×
                        </>
                    )}
                    <AverageSaleEditor businessId={businessId} averageSale={averageSale} />
                    average sale
                </p>
            </div>
            {verdict && (
                <p className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-success px-3.5 py-1.5 text-sm font-semibold text-success-foreground">
                    <PartyPopper className="size-4" aria-hidden />
                    {verdict}
                </p>
            )}
        </div>
    );
}
