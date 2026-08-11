import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AuditFinding } from "./load-audit-page-data";
import type { CrawlFindingSeverity } from "@/services/aeo/crawler/crawl-findings";
import type { ImpactLevel } from "@/services/aeo/crawler/finding-prompt-linkage";

const SEVERITY_ORDER: CrawlFindingSeverity[] = ["critical", "high", "medium", "low"];

const SEVERITY_STYLE: Record<CrawlFindingSeverity, string> = {
    critical: "bg-destructive/15 text-destructive border-0",
    high: "bg-chart-4/20 text-chart-4 border-0",
    medium: "bg-warning/15 text-warning-foreground border-0",
    low: "bg-muted text-muted-foreground border-0",
};

const IMPACT_LABEL: Record<ImpactLevel, string> = {
    confirmed: "Confirmed impact",
    likely: "Likely impact",
    possible: "Possible impact",
    no_demonstrated_impact: "No demonstrated impact",
};

/** F5.12: impact badge only rendered when it says something beyond "we don't know" — no_demonstrated_impact with zero prompts is not worth a badge on every row. */
function ImpactBadge({ finding }: { finding: AuditFinding }) {
    if (finding.impact.level === "no_demonstrated_impact") return null;
    return (
        <Badge variant="outline" className="text-xs">
            {IMPACT_LABEL[finding.impact.level]}
            {finding.impact.affectedPrompts.length > 0
                ? `: ${finding.impact.affectedPrompts.map((p) => p.promptText).join(", ")}`
                : ""}
        </Badge>
    );
}

export function AuditFindingsList({ findings }: { findings: AuditFinding[] }) {
    if (findings.length === 0) {
        return (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-chart-2" />
                No findings — this crawl found nothing to flag.
            </div>
        );
    }

    const bySeverity = SEVERITY_ORDER.map((severity) => ({
        severity,
        items: findings.filter((f) => f.severity === severity),
    })).filter((g) => g.items.length > 0);

    return (
        <div className="space-y-5">
            {bySeverity.map((group) => (
                <div key={group.severity} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge className={SEVERITY_STYLE[group.severity]}>{group.severity}</Badge>
                        <span className="text-xs text-muted-foreground">
                            {group.items.length} finding{group.items.length === 1 ? "" : "s"}
                        </span>
                    </div>
                    <ul className="space-y-3">
                        {group.items.map((finding) => (
                            <li key={finding.id} className="rounded-lg border border-border p-3">
                                <p className="text-sm font-medium">{finding.evidence}</p>
                                {finding.pageUrl && (
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{finding.pageUrl}</p>
                                )}
                                <p className="mt-2 text-xs text-muted-foreground">{finding.fixInstruction}</p>
                                <div className="mt-2">
                                    <ImpactBadge finding={finding} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
