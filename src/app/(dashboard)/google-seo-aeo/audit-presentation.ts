import { isScoredAudit, type AuditItem } from "./google-seo-aeo-audit-utils";

export type AuditSummary = {
    needsAttention: AuditItem[];
    onTrack: AuditItem[];
    unscored: AuditItem[];
};

/** Keeps the highest-value work first without changing how an audit is scored. */
export function summarizeAudits(audits: AuditItem[]): AuditSummary {
    return audits.reduce<AuditSummary>(
        (summary, audit) => {
            if (!isScoredAudit(audit)) {
                summary.unscored.push(audit);
            } else if (audit.status === "fail") {
                summary.needsAttention.push(audit);
            } else {
                summary.onTrack.push(audit);
            }
            return summary;
        },
        { needsAttention: [], onTrack: [], unscored: [] },
    );
}
