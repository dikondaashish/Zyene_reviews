import type { BillingRenewalSummary as Summary } from "@/services/stripe/billing-renewal-summary";

export function BillingRenewalSummary({ summary }: { summary?: Summary | null }) {
    return <section className="rounded-xl border border-border bg-card p-4" aria-label="Billing and usage dates">
        <h2 className="font-semibold">Billing and usage dates</h2>
        <p className="mt-2 text-sm">{summary ? <>
            {summary.canceled ? "Subscription ends" : "Next billing date"}: {summary.renewalAt ? new Date(summary.renewalAt).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" }) : "Not available"}.
            {summary.amount && <> Estimated next invoice: <strong>{summary.amount}</strong>. Changes, credits and usage can affect the final invoice.</>}
        </> : "Next invoice information is unavailable here. Open Manage subscription for your current invoice, renewal date and payment details."}</p>
        <p className="mt-2 text-sm text-muted-foreground">Request and customer-draft allowances reset each calendar month (UTC), independently of your subscription renewal. Business reply drafts are separate from customer review drafts. Standard request limits block further sending when exhausted; AI visibility budgets and overage controls are shown in the AI prompt library.</p>
    </section>;
}
