import { describe, expect, it } from "vitest";
import { parseTagInput } from "@/components/customers/bulk-add-tag-dialog";

describe("bulk Add Tag input", () => {
    it("splits on commas, trims and drops blanks", () => {
        expect(parseTagInput(" VIP , Repeat customer,, ")).toEqual(["VIP", "Repeat customer"]);
    });

    it("de-duplicates case-insensitively, keeping the first spelling", () => {
        expect(parseTagInput("vip, VIP, Vip")).toEqual(["vip"]);
    });

    it("stays within the bulk API limits", () => {
        const many = Array.from({ length: 30 }, (_, i) => `t${i}`).join(",");
        expect(parseTagInput(many)).toHaveLength(20);
        expect(parseTagInput("x".repeat(100))[0]).toHaveLength(80);
    });

    it("returns nothing for empty input", () => {
        expect(parseTagInput("  ,  ")).toEqual([]);
    });
});
