import { describe, expect, it } from "vitest";
import { parseBulkContactLines } from "@/app/(dashboard)/campaigns/[id]/use-campaign-detail-send";

describe("campaign bulk add lines", () => {
    it("reads emails and phones from one list, skipping blank lines", () => {
        expect(parseBulkContactLines(" ann@example.com \n\n(555) 123-4567\n"))
            .toEqual([{ email: "ann@example.com" }, { phone: "(555) 123-4567" }]);
    });
});
