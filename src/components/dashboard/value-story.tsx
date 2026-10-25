import type { AverageSale, ReviewValue } from "@/lib/dashboard/review-value";
import { AverageSaleEditor } from "@/components/dashboard/average-sale-editor";

const fmt = (n: number) => n.toLocaleString("en-US");
const usd = (n: number, cents = n % 1 !== 0) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

/** "12× your $29.99 plan", or null when there is nothing honest to compare. */
export function paybackLabel(newReviews: number, monthlyPrice: number | null, value: ReviewValue): string | null {
    const multiple = value.returnMultiple;
    if (newReviews === 0 || monthlyPrice === null) return null;
    if (monthlyPrice === 0) return "Free during your trial";
    if (multiple === null) return null;
    if (multiple >= 1) return `${multiple >= 10 ? fmt(Math.round(multiple)) : multiple.toFixed(1)}× your ${usd(monthlyPrice, true)} plan`;
    return `${Math.round(multiple * 100)}% of your plan paid back`;
}

/** The maths in one line: reviews × the owner's (editable) average sale ≈ new business. */
export function ValueStory({
    businessId,
    monthLabel,
    newReviews,
    averageSale,
    reviewValue,
}: {
    businessId: string;
    monthLabel: string;
    newReviews: number;
    averageSale: AverageSale;
    reviewValue: ReviewValue;
}) {
    if (newReviews === 0) {
        return (
            <span>
                Each new review is worth about <AverageSaleEditor businessId={businessId} averageSale={averageSale} /> to you.
            </span>
        );
    }
    return (
        <span>
            In {monthLabel}, <span className="font-semibold text-warning-foreground">{fmt(newReviews)} reviews</span> ×{" "}
            <AverageSaleEditor businessId={businessId} averageSale={averageSale} /> avg sale ≈{" "}
            <span className="font-semibold text-success" title="Estimate: each new review ≈ 1 new customer at your average sale">
                {usd(reviewValue.valueUsd)}
            </span>{" "}
            in new business.
        </span>
    );
}
