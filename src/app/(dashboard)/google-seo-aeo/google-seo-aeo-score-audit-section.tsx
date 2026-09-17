import { RunAuditControls } from "@/components/google-seo-aeo/run-audit-controls";
import { areEstimatedAeoSurfacesEnabled } from "@/lib/features/aeo-surfaces";
import { getAuditFixAction, type AuditStatus } from "./google-seo-aeo-audit-utils";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import { AuditCheckRow } from "./audit-check-row";
import { summarizeAudits } from "./audit-presentation";
import { AeoProfileHealthSummary } from "./aeo-profile-health-summary";

/** Why a row carries no score. Distinct wording per cause, never a blanket one. */
const UNSCORED_LABEL: Partial<Record<AuditStatus, string>> = {
    pending: "Not built yet",
    unavailable: "No data from Google",
    "not-applicable": "Does not apply",
};

export function GoogleSeoAeoScoreAuditSection({ content }: { content: GoogleSeoAeoContentProps }) {
    const summary = summarizeAudits(content.audits);
    const firstPriority = summary.needsAttention[0];

    return (
        <section className="space-y-5" aria-labelledby="google-visibility-title">
            <header className="flex flex-col gap-3 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Local discovery</p>
                    <h1
                        id="google-visibility-title"
                        className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                    >
                        Google SEO &amp; AI visibility
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        A practical view of what will strengthen {content.businessName} in Google Search and answer
                        engines.
                    </p>
                </div>
                {areEstimatedAeoSurfacesEnabled() ? <RunAuditControls businessId={content.businessId} /> : null}
            </header>

            <AeoProfileHealthSummary content={content} summary={summary} priorityAudit={firstPriority} />

            <section className="overflow-hidden rounded-xl border bg-card" aria-labelledby="audit-results-title">
                <div className="flex flex-col gap-2 border-b border-border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 id="audit-results-title" className="text-lg font-semibold">
                            What to work on
                        </h2>
                        <span className="text-sm text-muted-foreground">Direct Google-ready actions</span>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Improvements lead the list. Completed checks stay visible below, with their related workflow one
                        click away.
                    </p>
                </div>
                {summary.needsAttention.length > 0 ? (
                    <div className="divide-y divide-border">
                        {summary.needsAttention.map((audit) => (
                            <AuditCheckRow
                                key={audit.id}
                                audit={audit}
                                action={getAuditFixAction(audit.id)}
                                statusLabel="Needs attention"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="px-5 py-6 text-sm text-muted-foreground sm:px-6">
                        Every measured check is currently on track.
                    </div>
                )}
                {summary.onTrack.length > 0 ? (
                    <div className="border-t border-border bg-muted/25">
                        <div className="px-5 py-3 text-sm font-medium text-muted-foreground sm:px-6">On track</div>
                        <div className="divide-y divide-border">
                            {summary.onTrack.map((audit) => (
                                <AuditCheckRow
                                    key={audit.id}
                                    audit={audit}
                                    action={getAuditFixAction(audit.id)}
                                    statusLabel="On track"
                                />
                            ))}
                        </div>
                    </div>
                ) : null}
            </section>

            {summary.unscored.length > 0 ? (
                <section
                    className="overflow-hidden rounded-xl border border-dashed bg-muted/20"
                    aria-labelledby="unscored-checks-title"
                >
                    <div className="border-b border-dashed border-border px-5 py-4 sm:px-6">
                        <h2 id="unscored-checks-title" className="font-medium text-foreground">
                            Outside the score
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            These checks have a distinct status and do not affect profile health.
                        </p>
                    </div>
                    <div className="divide-y divide-dashed divide-border">
                        {summary.unscored.map((audit) => (
                            <AuditCheckRow
                                key={audit.id}
                                audit={audit}
                                statusLabel={UNSCORED_LABEL[audit.status] ?? "Not scored"}
                            />
                        ))}
                    </div>
                </section>
            ) : null}
        </section>
    );
}
