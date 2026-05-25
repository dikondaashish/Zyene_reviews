"use client";

import type { LocalSeoChecklistLeadReport } from "@/lib/marketing/local-seo-checklist-lead-report";

function MetricCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-1 tabular-nums">{value}</p>
        </div>
    );
}

function isEmptyReport(report: LocalSeoChecklistLeadReport): boolean {
    return (
        report.pageViews === 0 &&
        report.submissions === 0 &&
        report.subscribeSuccesses === 0 &&
        report.signupClicks === 0 &&
        report.pricingClicks === 0 &&
        report.latestSubmissions.length === 0
    );
}

export function GrowthDashboardLocalSeoSection({ report }: { report: LocalSeoChecklistLeadReport }) {
    const empty = isEmptyReport(report);
    const conversion =
        report.conversionRatePercent !== null ? `${report.conversionRatePercent}%` : "—";

    return (
        <section className="space-y-4" aria-labelledby="local-seo-lead-heading">
            <div>
                <h2 id="local-seo-lead-heading" className="text-lg font-semibold">
                    Local SEO checklist lead magnet
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Funnel for{" "}
                    <code className="text-xs bg-muted px-1 rounded">/resources/local-seo-checklist</code>
                    {" "}— last {report.periodDays} days (since{" "}
                    {new Date(report.since).toLocaleDateString()}). QA traffic excluded.
                </p>
            </div>

            {empty ? (
                <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-6 text-center">
                    No events recorded yet for this period.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <MetricCard label="Page views" value={report.pageViews} />
                        <MetricCard label="Form submits" value={report.submissions} />
                        <MetricCard label="Subscribe OK" value={report.subscribeSuccesses} />
                        <MetricCard label="Conversion" value={conversion} />
                        <MetricCard label="Signup clicks" value={report.signupClicks} />
                        <MetricCard label="Pricing clicks" value={report.pricingClicks} />
                    </div>

                    {report.latestSubmissions.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-left text-sm min-w-[480px]">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="py-2 px-3 font-medium">Subscribed</th>
                                        <th className="py-2 px-3 font-medium">Source</th>
                                        <th className="py-2 px-3 font-medium">UTM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.latestSubmissions.map((row) => (
                                        <tr
                                            key={`${row.subscribed_at}-${row.email}`}
                                            className="border-b border-border/60"
                                        >
                                            <td className="py-2 px-3 text-muted-foreground">
                                                {new Date(row.subscribed_at).toLocaleString()}
                                            </td>
                                            <td className="py-2 px-3">{row.source}</td>
                                            <td className="py-2 px-3 text-muted-foreground">
                                                {[row.utm_source, row.utm_medium, row.utm_campaign]
                                                    .filter(Boolean)
                                                    .join(" / ") || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </>
            )}
        </section>
    );
}
