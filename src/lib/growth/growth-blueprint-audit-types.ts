// Automated audit — GROWTH_BLUEPRINT §§ 0–8, 14–16 + page architecture table

export type AuditSeverity = "error" | "warning" | "info";

export interface BlueprintAuditItem {
    id: string;
    severity: AuditSeverity;
    area:
        | "foundation"
        | "market"
        | "architecture"
        | "kpi"
        | "pages"
        | "matrix"
        | "content"
        | "phase0"
        | "phase1"
        | "phase2"
        | "phase3";
    message: string;
    remediation?: string;
}
