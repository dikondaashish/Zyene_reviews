import type { BillingRenewalSummary as Summary } from "@/services/stripe/billing-renewal-summary";

export function BillingRenewalSummary({ summary }: { summary?: Summary | null }) {
    return <section className="grid gap-5 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 sm:gap-8 sm:p-6" aria-label="Billing and usage dates">
        <div><h2 className="text-sm font-semibold">Subscription renewal</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary ? <>
            {summary.canceled ? "Subscription ends" : "Next billing date"}: {summary.renewalAt ? new Date(summary.renewalAt).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" }) : "Not available"}.
            {summary.amount && <> Estimated next invoice: <strong>{summary.amount}</strong>. Changes, credits and usage can affect the final invoice.</>}
        </> : "Open the billing portal for your next invoice, renewal date, and payment details."}</p></div>
        <div><h2 className="text-sm font-semibold">Monthly allowances</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Requests and customer review drafts reset each calendar month (UTC), separately from your subscription renewal.</p>
        <details className="mt-2 text-xs leading-5 text-muted-foreground">
            <summary className="w-fit cursor-pointer rounded-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-ring">How usage limits work</summary>
            <p className="mt-2">Business reply drafts are separate from customer review drafts. Standard request limits block further sending when exhausted. AI visibility budgets and overage controls are available in the AI prompt library.</p>
        </details></div>
    </section>;
}
