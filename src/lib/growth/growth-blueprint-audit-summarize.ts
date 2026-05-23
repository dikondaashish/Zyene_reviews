import type { BlueprintAuditItem } from "./growth-blueprint-audit-types";

export function summarizeBlueprintAudit(items: BlueprintAuditItem[]) {
    return {
        errors: items.filter((i) => i.severity === "error").length,
        warnings: items.filter((i) => i.severity === "warning").length,
        info: items.filter((i) => i.severity === "info").length,
        passed: items.filter((i) => i.severity === "error").length === 0,
    };
}
