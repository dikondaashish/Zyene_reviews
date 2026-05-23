import { buildGrowthPageInventory } from "@/lib/growth/page-inventory";
import { PRODUCT_PILLARS, POSITIONING } from "@/lib/growth/product-foundation";
import { COMPETITOR_SLUGS } from "@/lib/phase3/competitor-data";
import { KPI_DEFINITIONS } from "@/lib/growth/kpi-definitions";
import { existsSync } from "node:fs";
import path from "node:path";
import type { BlueprintAuditItem } from "./growth-blueprint-audit-types";
import { APP_ROOT, BLUEPRINT_FEATURE_PILLARS } from "./growth-blueprint-audit-read";
import { appendGrowthBlueprintAuditPart1 } from "./growth-blueprint-audit-run-part1";
import { appendGrowthBlueprintAuditPart2 } from "./growth-blueprint-audit-run-part2";

export function runGrowthBlueprintAudit(): BlueprintAuditItem[] {
    const items: BlueprintAuditItem[] = [];
    const inventory = buildGrowthPageInventory();
    const inventoryPaths = new Set(inventory.map((p) => p.path));

    if (PRODUCT_PILLARS.length !== 10) {
        items.push({
            id: "foundation-pillars",
            severity: "error",
            area: "foundation",
            message: `Expected 10 product pillars in product-foundation.ts, found ${PRODUCT_PILLARS.length}`,
        });
    }

    if (!POSITIONING.oneLiner.includes("Birdeye")) {
        items.push({
            id: "foundation-positioning",
            severity: "warning",
            area: "foundation",
            message: "Positioning one-liner may be out of sync with blueprint §2.3",
        });
    }

    for (const slug of BLUEPRINT_FEATURE_PILLARS) {
        const pillarPath = `/features/${slug}`;
        if (!existsSync(path.join(APP_ROOT, "features/[pillar]/page.tsx"))) {
            items.push({
                id: "feature-route-missing",
                severity: "error",
                area: "architecture",
                message: "Feature pillar dynamic route missing",
            });
            break;
        }
        if (!inventoryPaths.has(pillarPath)) {
            items.push({
                id: `feature-inv-${slug}`,
                severity: "error",
                area: "architecture",
                message: `Feature pillar not in page inventory: ${pillarPath}`,
            });
        }
    }

    if (!existsSync(path.join(process.cwd(), "src/app/sitemap.ts"))) {
        items.push({ id: "sitemap", severity: "error", area: "architecture", message: "sitemap.ts missing" });
    }
    if (!existsSync(path.join(process.cwd(), "src/app/robots.ts"))) {
        items.push({ id: "robots", severity: "error", area: "architecture", message: "robots.ts missing" });
    }

    for (const slug of COMPETITOR_SLUGS) {
        if (!inventoryPaths.has(`/compare/${slug}`)) {
            items.push({
                id: `compare-${slug}`,
                severity: "error",
                area: "market",
                message: `Comparison page missing: /compare/${slug}`,
            });
        }
    }

    if (KPI_DEFINITIONS.length !== 15) {
        items.push({
            id: "kpi-count",
            severity: "error",
            area: "kpi",
            message: `Expected 15 KPI definitions, found ${KPI_DEFINITIONS.length}`,
        });
    }

    const needsSessions = KPI_DEFINITIONS.find((k) => k.id === "visitor_signup_rate");
    if (needsSessions?.computable && !process.env.GROWTH_MARKETING_SESSIONS_30D) {
        items.push({
            id: "kpi-sessions-env",
            severity: "info",
            area: "kpi",
            message: "Visitor → signup rate needs GROWTH_MARKETING_SESSIONS_30D or Vercel/GA sessions",
            remediation: "Set GROWTH_MARKETING_SESSIONS_30D in env for automatic % on /growth",
        });
    }

    appendGrowthBlueprintAuditPart1(items, inventory, inventoryPaths);
    appendGrowthBlueprintAuditPart2(items, inventoryPaths);

    if (items.filter((i) => i.severity === "error").length === 0 && items.filter((i) => i.id !== "all-clear").length === 0) {
        items.push({
            id: "all-clear",
            severity: "info",
            area: "pages",
            message: "All automated blueprint checks passed. External ops (ads, GSC, G2, NPS) still run manually.",
        });
    }

    return items;
}
