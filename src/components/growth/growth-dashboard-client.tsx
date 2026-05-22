"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    KPI_DEFINITIONS,
    type KpiCategory,
    type KpiDefinition,
} from "@/lib/growth/kpi-definitions";
import type { GrowthKpiSnapshot, KpiMetricValue, KpiStatus } from "@/lib/growth/kpi-metrics";
import {
    buildGrowthPageInventory,
    summarizePageInventory,
    type GrowthPageEntry,
} from "@/lib/growth/page-inventory";
import {
    GROWTH_IMPLEMENTATION_MATRIX,
    summarizeImplementationMatrix,
    type MatrixTaskStatus,
} from "@/lib/growth/implementation-matrix";
import { cn } from "@/lib/utils";
import type { BlueprintAuditItem } from "@/lib/growth/growth-blueprint-audit";

const CATEGORY_LABELS: Record<KpiCategory, string> = {
    acquisition: "Acquisition",
    conversion: "Conversion",
    retention: "Retention & revenue",
    plg: "Viral / PLG",
};

function statusBadge(status: KpiStatus | MatrixTaskStatus) {
    const map: Record<string, string> = {
        above: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        on_track: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
        below: "bg-red-500/15 text-red-700 dark:text-red-400",
        unknown: "bg-muted text-muted-foreground",
        external: "bg-blue-500/15 text-blue-800 dark:text-blue-300",
        complete: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
        ongoing: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
        deferred: "bg-muted text-muted-foreground",
    };
    return map[status] ?? map.unknown;
}

function KpiRow({ def, metric }: { def: KpiDefinition; metric: KpiMetricValue | undefined }) {
    const status = metric?.status ?? (def.computable ? "unknown" : "external");
    return (
        <tr className="border-b border-border last:border-0">
            <td className="py-3 pr-4 align-top">
                <div className="font-medium text-sm">{def.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 max-w-md">{def.description}</div>
            </td>
            <td className="py-3 px-2 text-sm text-muted-foreground align-top whitespace-nowrap">
                {def.source}
            </td>
            <td className="py-3 px-2 text-sm align-top whitespace-nowrap">{def.targetLabel}</td>
            <td className="py-3 px-2 text-sm font-mono align-top whitespace-nowrap">
                {metric?.displayValue ?? "—"}
            </td>
            <td className="py-3 pl-2 align-top">
                <span
                    className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        statusBadge(status)
                    )}
                >
                    {status.replace("_", " ")}
                </span>
                {def.externalUrl ? (
                    <a
                        href={def.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-primary mt-1 hover:underline"
                    >
                        Open source →
                    </a>
                ) : null}
            </td>
        </tr>
    );
}

type TabId = "kpis" | "pages" | "matrix" | "audit";

export function GrowthDashboardClient({
    snapshot,
    auditItems,
    auditSummary,
}: {
    snapshot: GrowthKpiSnapshot;
    auditItems: BlueprintAuditItem[];
    auditSummary: { errors: number; warnings: number; info: number; passed: boolean };
}) {
    const [tab, setTab] = useState<TabId>("kpis");
    const [pageFilter, setPageFilter] = useState<"all" | "live" | "sitemap">("all");

    const metricById = useMemo(
        () => Object.fromEntries(snapshot.metrics.map((m) => [m.id, m])),
        [snapshot.metrics]
    );

    const pages = useMemo(() => buildGrowthPageInventory(), []);
    const pageSummary = useMemo(() => summarizePageInventory(pages), [pages]);
    const matrixSummary = useMemo(
        () => summarizeImplementationMatrix(GROWTH_IMPLEMENTATION_MATRIX),
        []
    );

    const filteredPages = useMemo(() => {
        if (pageFilter === "live") return pages.filter((p) => p.status === "live");
        if (pageFilter === "sitemap") return pages.filter((p) => p.inSitemap);
        return pages;
    }, [pages, pageFilter]);

    const tabs: { id: TabId; label: string }[] = [
        { id: "kpis", label: "KPI dashboard" },
        { id: "pages", label: "Page architecture" },
        { id: "matrix", label: "Priority matrix" },
        {
            id: "audit",
            label: auditSummary.errors > 0 ? `Audit (${auditSummary.errors})` : "Audit ✓",
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
            <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal · Growth blueprint
                </p>
                <h1 className="text-3xl font-bold tracking-tight">Growth operations center</h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Live product metrics ({snapshot.periodLabel}), full URL inventory, and phased
                    implementation status. Source of truth:{" "}
                    <code className="text-xs bg-muted px-1 rounded">docs/GROWTH_BLUEPRINT.md</code>
                    {" · "}
                    runbook: <code className="text-xs bg-muted px-1 rounded">docs/GROWTH_OPERATIONS.md</code>
                </p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Signups (period)" value={String(snapshot.counts.signupsInPeriod)} />
                <StatCard label="Paid orgs" value={String(snapshot.counts.activePaidOrgs)} />
                <StatCard label="Trialing" value={String(snapshot.counts.trialingOrgs)} />
                <StatCard label="Live URLs" value={String(pageSummary.live)} />
            </div>

            <div className="grid sm:grid-cols-4 gap-3 text-sm">
                <LeadCard label="Newsletter leads" value={snapshot.leads.newsletterSubscribers} />
                <LeadCard label="Demo requests" value={snapshot.leads.demoRequests} />
                <LeadCard label="Free-tool leads" value={snapshot.leads.freeToolLeads} />
                <LeadCard label="Partner / agency" value={snapshot.leads.partnerLeads} />
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border pb-2">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
                            tab === t.id
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "kpis" ? (
                <section className="space-y-8">
                    {(["acquisition", "conversion", "retention", "plg"] as KpiCategory[]).map(
                        (cat) => (
                            <div key={cat}>
                                <h2 className="text-lg font-semibold mb-3">{CATEGORY_LABELS[cat]}</h2>
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-left min-w-[720px]">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                                                <th className="py-2 px-3 font-medium">Metric</th>
                                                <th className="py-2 px-2 font-medium">Source</th>
                                                <th className="py-2 px-2 font-medium">Target</th>
                                                <th className="py-2 px-2 font-medium">Current</th>
                                                <th className="py-2 px-3 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {KPI_DEFINITIONS.filter((d) => d.category === cat).map(
                                                (def) => (
                                                    <KpiRow
                                                        key={def.id}
                                                        def={def}
                                                        metric={metricById[def.id]}
                                                    />
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </section>
            ) : null}

            {tab === "pages" ? (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-muted-foreground">
                            {pageSummary.total} routes · {pageSummary.inSitemap} in sitemap
                        </span>
                        {(["all", "live", "sitemap"] as const).map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setPageFilter(f)}
                                className={cn(
                                    "px-3 py-1 rounded-full border text-xs",
                                    pageFilter === f
                                        ? "border-primary bg-primary/10"
                                        : "border-border"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border max-h-[70vh]">
                        <table className="w-full text-left text-sm min-w-[800px]">
                            <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                                <tr className="text-xs uppercase text-muted-foreground">
                                    <th className="py-2 px-3">Path</th>
                                    <th className="py-2 px-2">Phase</th>
                                    <th className="py-2 px-2">Priority</th>
                                    <th className="py-2 px-2">Type</th>
                                    <th className="py-2 px-2">Status</th>
                                    <th className="py-2 px-2">Sitemap</th>
                                    <th className="py-2 px-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPages.map((p) => (
                                    <PageRow key={p.path} page={p} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            {tab === "audit" ? (
                <section className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Automated checks for blueprint §§14–16.{" "}
                        {auditSummary.passed ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                No blocking errors.
                            </span>
                        ) : (
                            <span className="text-destructive font-medium">
                                Fix errors below.
                            </span>
                        )}{" "}
                        ({auditSummary.errors} errors, {auditSummary.warnings} warnings,{" "}
                        {auditSummary.info} notes)
                    </p>
                    <ul className="space-y-2">
                        {auditItems.map((item) => (
                            <li
                                key={item.id}
                                className={cn(
                                    "rounded-lg border px-4 py-3 text-sm",
                                    item.severity === "error"
                                        ? "border-destructive/40 bg-destructive/5"
                                        : item.severity === "warning"
                                          ? "border-amber-500/30 bg-amber-500/5"
                                          : "border-border bg-card"
                                )}
                            >
                                <span className="font-medium capitalize">{item.severity}</span>
                                <span className="text-muted-foreground"> · {item.area}</span>
                                <p className="mt-1">{item.message}</p>
                                {item.remediation ? (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        → {item.remediation}
                                    </p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {tab === "matrix" ? (
                <section className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        {matrixSummary.complete} / {matrixSummary.total} tasks complete ·{" "}
                        {matrixSummary.ongoing} ongoing · {matrixSummary.external} external ops ·{" "}
                        {matrixSummary.deferred} deferred
                    </p>
                    {GROWTH_IMPLEMENTATION_MATRIX.map((phase) => (
                        <div
                            key={phase.phase}
                            className="rounded-xl border border-border overflow-hidden"
                        >
                            <div className="bg-muted/40 px-4 py-3 flex flex-wrap justify-between gap-2">
                                <div>
                                    <span className="text-xs font-semibold text-primary">
                                        Phase {phase.phase}
                                    </span>
                                    <h3 className="font-semibold">{phase.title}</h3>
                                    <p className="text-xs text-muted-foreground">{phase.weekRange}</p>
                                </div>
                                <span
                                    className={cn(
                                        "self-start rounded-full px-2 py-0.5 text-xs font-medium",
                                        statusBadge(phase.status === "complete" ? "complete" : "ongoing")
                                    )}
                                >
                                    {phase.status}
                                </span>
                            </div>
                            {phase.blocks.map((block) => (
                                <div key={block.weekLabel} className="border-t border-border px-4 py-3">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                        {block.weekLabel}
                                    </p>
                                    <ul className="space-y-2">
                                        {block.tasks.map((task) => (
                                            <li
                                                key={task.id}
                                                className="flex flex-wrap items-start gap-2 text-sm"
                                            >
                                                <span
                                                    className={cn(
                                                        "rounded-full px-2 py-0.5 text-xs shrink-0",
                                                        statusBadge(task.status)
                                                    )}
                                                >
                                                    {task.status}
                                                </span>
                                                <span className="font-medium">{task.title}</span>
                                                {task.deliverable ? (
                                                    <span className="text-muted-foreground text-xs">
                                                        → {task.deliverable}
                                                    </span>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))}
                </section>
            ) : null}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
        </div>
    );
}

function LeadCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold tabular-nums">{value}</p>
        </div>
    );
}

function PageRow({ page }: { page: GrowthPageEntry }) {
    const href = page.path.includes("[") ? null : page.path;
    return (
        <tr className="border-b border-border/60 hover:bg-muted/30">
            <td className="py-2 px-3 font-mono text-xs">
                {href && page.status === "live" ? (
                    <Link href={href} className="text-primary hover:underline" target="_blank">
                        {page.path}
                    </Link>
                ) : (
                    page.path
                )}
            </td>
            <td className="py-2 px-2">{page.phase}</td>
            <td className="py-2 px-2">{page.priority}</td>
            <td className="py-2 px-2 text-muted-foreground">{page.pageType}</td>
            <td className="py-2 px-2">{page.status}</td>
            <td className="py-2 px-2">{page.inSitemap ? "yes" : "—"}</td>
            <td className="py-2 px-3 text-xs text-muted-foreground max-w-xs">{page.notes ?? ""}</td>
        </tr>
    );
}
