import Link from "next/link";
import {
    PRICES_CHECKED_ON,
    PROFESSIONAL_PRICE,
    SMALL_BUSINESS_PRICE_ROWS,
    STARTER_PRICE,
} from "@/lib/marketing/small-business-content";

export function SmallBusinessPricingSection() {
    return (
        <section className="py-20 px-4 bg-background border-b border-border">
            <div className="container mx-auto max-w-5xl grid lg:grid-cols-2 gap-10 items-start">
                <div>
                    <h2 className="text-[length:var(--fs-h2)] font-semibold mb-4">Affordable review management, with the price on the page</h2>
                    <p className="text-muted-foreground mb-4">
                        Starter is {STARTER_PRICE}/month for one location. If you grow to a second or third location,
                        Professional is {PROFESSIONAL_PRICE}/month. You don&apos;t need a demo to find out what it costs.
                    </p>
                    <Link href="/pricing" className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">
                        Compare plans and limits →
                    </Link>
                </div>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <caption className="sr-only">Starting prices for review management software</caption>
                        <thead className="bg-muted">
                            <tr>
                                <th scope="col" className="px-5 py-3 text-left font-semibold">Tool</th>
                                <th scope="col" className="px-5 py-3 text-left font-semibold">Starting price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SMALL_BUSINESS_PRICE_ROWS.map((row) => (
                                <tr key={row.name} className="border-t border-border">
                                    <th scope="row" className="px-5 py-3 text-left font-medium">{row.name}</th>
                                    <td className="px-5 py-3 text-muted-foreground">
                                        {row.source ? <a href={row.source} rel="noopener" className="underline">{row.price}</a> : row.price}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="px-5 py-3 text-xs text-muted-foreground border-t border-border">
                        Competitor prices from their public pricing pages, checked {PRICES_CHECKED_ON}. Confirm current quotes.{" "}
                        <Link href="/compare" className="underline">See full comparisons</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
