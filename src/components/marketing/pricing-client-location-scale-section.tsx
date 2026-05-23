"use client";

export function PricingClientLocationScaleSection() {
    return (
        <section className="py-20 px-4 bg-muted/50 border-y border-border">
            <div className="container mx-auto max-w-4xl">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center">
                    How Professional scales per location
                </h2>
                <p className="text-muted-foreground text-center mb-10">
                    Each location gets its own full set of limits. Nothing shared.
                </p>
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted">
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Metric</th>
                                <th className="px-6 py-4 font-semibold text-primary text-center">1 Location</th>
                                <th className="px-6 py-4 font-semibold text-primary text-center">2 Locations</th>
                                <th className="px-6 py-4 font-semibold text-primary text-center">3 Locations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { metric: "Email review requests / mo", per: 700 },
                                { metric: "SMS review requests / mo", per: 700 },
                                { metric: "AI reply suggestions / mo", per: 2000 },
                            ].map(({ metric, per }) => (
                                <tr
                                    key={metric}
                                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-foreground">{metric}</td>
                                    <td className="px-6 py-4 text-center text-muted-foreground">{per.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center text-muted-foreground">
                                        {(per * 2).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center font-semibold text-foreground">
                                        {(per * 3).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            <tr className="border-b border-border last:border-0 bg-primary/5">
                                <td className="px-6 py-4 font-semibold text-foreground">Monthly price</td>
                                <td className="px-6 py-4 text-center font-bold text-foreground">$59.99</td>
                                <td className="px-6 py-4 text-center font-bold text-foreground">$59.99</td>
                                <td className="px-6 py-4 text-center font-bold text-primary text-lg">$59.99</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    One flat rate covers all 3 locations. No per-location surcharge on Professional.
                </p>
            </div>
        </section>
    );
}
