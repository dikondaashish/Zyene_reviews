import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("POS integration OAuth management boundary", () => {
    it("requires management rights before connect and before callback admin writes", () => {
        for (const provider of ["square", "clover"]) {
            for (const stage of ["connect", "callback"]) {
                const source = readFileSync(join(process.cwd(),
                    `src/app/api/integrations/${provider}/${stage}/route.ts`), "utf8");
                expect(source, `${provider}/${stage}`).toContain("canManageBusinessIntegration(");
                expect(source, `${provider}/${stage}`).not.toContain("userCanAccessBusiness(");
                if (stage === "callback") {
                    expect(source.indexOf("canManageBusinessIntegration("))
                        .toBeLessThan(source.indexOf("createAdminClient()"));
                }
            }
        }
    });
});
