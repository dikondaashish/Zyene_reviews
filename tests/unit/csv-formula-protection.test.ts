import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";
import { SAFE_CSV_OPTIONS } from "@/lib/export/safe-csv";

describe("CSV formula protection", () => {
    it("prefixes spreadsheet formulas including whitespace-prefixed payloads", () => {
        const values = ["=1+2", "+SUM(A1)", "-cmd", "@HYPERLINK(A1)",
            "  =1+2", "\t=1+2", "\r=1+2", "normal", "O'Neil"];
        const csv = Papa.unparse(values.map((value) => ({ value })), SAFE_CSV_OPTIONS);
        const parsed = Papa.parse<{ value: string }>(csv, { header: true }).data;
        expect(parsed.map((row) => row.value)).toEqual(values.map((value, index) =>
            index < 7 ? `'${value}` : value));
    });

    it("uses the safe option for every application CSV export", () => {
        const paths = [
            "src/app/api/requests/export/route.ts",
            "src/services/reviews/export-api.ts",
            "src/services/competitors/export-api.ts",
            "src/app/api/analytics/export/route.ts",
            "src/services/aeo/reporting/export-citations.ts",
            "src/services/aeo/reporting/export-prompts.ts",
            "src/services/aeo/crawler/export-crawl-findings.ts",
        ];
        for (const path of paths) {
            const source = readFileSync(join(process.cwd(), path), "utf8");
            const writes = source.match(/Papa\.unparse\([^;]+\)/g) ?? [];
            expect(writes.length, path).toBeGreaterThan(0);
            expect(writes.every((write) => write.includes("SAFE_CSV_OPTIONS")), path).toBe(true);
        }
    });
});
