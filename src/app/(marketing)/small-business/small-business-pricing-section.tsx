import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
    PRICES_CHECKED_ON,
    PROFESSIONAL_PRICE,
    SMALL_BUSINESS_PRICE_ROWS,
    STARTER_PRICE,
} from "@/lib/marketing/small-business-content";

export function SmallBusinessPricingSection() {
    return (
        <section className="marketing-section" aria-labelledby="small-business-pricing-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Pricing</p>
                    <h2 id="small-business-pricing-heading">Affordable review management, with the price on the page</h2>
                    <p>
                        Starter is {STARTER_PRICE}/month for one location. If you grow to a second or third location,
                        Professional is {PROFESSIONAL_PRICE}/month. You don&apos;t need a demo to find out what it costs.
                    </p>
                    <div className="mi-link-row">
                        <Link href="/pricing" className="home-text-link">
                            Compare plans and limits <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                        <Link href="/enterprise" className="home-text-link">
                            Enterprise for larger groups <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
                <div>
                    <div className="mi-table-wrap">
                        <table className="mi-table">
                            <caption className="sr-only">Starting prices for review management software</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Tool</th>
                                    <th scope="col">Starting price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {SMALL_BUSINESS_PRICE_ROWS.map((row) => (
                                    <tr key={row.name}>
                                        <th scope="row">{row.name}</th>
                                        <td>{row.source ? <a href={row.source} rel="noopener">{row.price}</a> : row.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mi-table-note">
                        Competitor prices from their public pricing pages, checked {PRICES_CHECKED_ON}. Confirm current quotes.{" "}
                        <Link href="/compare">See full comparisons</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
