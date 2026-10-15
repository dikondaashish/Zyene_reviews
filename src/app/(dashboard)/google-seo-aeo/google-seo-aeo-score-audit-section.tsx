import { RunAuditControls } from "@/components/google-seo-aeo/run-audit-controls";
import { areEstimatedAeoSurfacesEnabled } from "@/lib/features/aeo-surfaces";
import { getAuditFixAction, type AuditItem, type AuditStatus } from "./google-seo-aeo-audit-utils";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import { AuditCheckRow } from "./audit-check-row";
import { summarizeAudits } from "./audit-presentation";
import { AeoProfileHealthSummary } from "./aeo-profile-health-summary";
import { SeoSection } from "./seo-section";

/** Why a row carries no score. Distinct wording per cause, never a blanket one. */
const UNSCORED_LABEL: Partial<Record<AuditStatus, string>> = {
    pending: "Coming soon",
    unavailable: "No data from Google",
    "not-applicable": "Does not apply",
};

/** Secondary lists stay one click away instead of pushing the work list down the page. */
function CollapsedChecks({ title, audits, unscored }: { title: string; audits: AuditItem[]; unscored?: boolean }) {
    if (audits.length === 0) return null;
    return (
        <details className="group border-t border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground sm:px-6 [&::-webkit-details-marker]:hidden">
                <span>
                    {title} <span className="tabular-nums">({audits.length})</span>
                </span>
                <span className="text-xs group-open:hidden">Show</span>
                <span className="hidden text-xs group-open:inline">Hide</span>
            </summary>
            <div className="divide-y divide-border border-t border-border bg-muted/20">
                {audits.map((audit) => (
                    <AuditCheckRow
                        key={audit.id}
                        audit={audit}
                        action={unscored ? undefined : getAuditFixAction(audit.id)}
                        statusLabel={unscored ? (UNSCORED_LABEL[audit.status] ?? "Not scored") : "On track"}
                    />
                ))}
            </div>
        </details>
    );
}

export function GoogleSeoAeoScoreAuditSection({ content }: { content: GoogleSeoAeoContentProps }) {
    const summary = summarizeAudits(content.audits);
    const toFix = summary.needsAttention.length;

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 id="google-visibility-title" className="ui-page-title">
                        Google SEO &amp; AI visibility
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                        How {content.businessName} shows up in Google Search and AI answers, and what to improve next.
                    </p>
                </div>
                {areEstimatedAeoSurfacesEnabled() ? <RunAuditControls businessId={content.businessId} /> : null}
            </header>

            <AeoProfileHealthSummary content={content} summary={summary} priorityAudit={summary.needsAttention[0]} />

            <SeoSection
                id="audit-results-title"
                title="What to fix"
                description="Highest-impact improvements first. Each one links straight to where you fix it."
                actions={
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
                        {toFix === 0 ? "All clear" : `${toFix} open`}
                    </span>
                }
            >
                {toFix > 0 ? (
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
                    <p className="px-5 py-6 text-sm text-muted-foreground sm:px-6">
                        Nothing to fix right now. Every measured check is on track.
                    </p>
                )}
                <CollapsedChecks title="On track" audits={summary.onTrack} />
                <CollapsedChecks title="Not scored" audits={summary.unscored} unscored />
            </SeoSection>
        </div>
    );
}
