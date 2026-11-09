import { describe, expect, it } from "vitest";
import { buildImportRow } from "@/app/(dashboard)/customers/import/import-customers-submit";
import { customersImportSchema } from "@/services/customers/import-schema";

const mapping = { first_name: "First", last_name: "", email: "Email", phone: "Phone" };

describe("customer import page rows", () => {
    it("omits unmapped and blank columns instead of sending null", () => {
        const row = buildImportRow({ First: " Ann ", Email: "", Phone: "555 123 4567" }, mapping);
        expect(row).toEqual({ first_name: "Ann", phone: "555 123 4567" });
        expect(customersImportSchema.safeParse({ customers: [row] }).success).toBe(true);
    });

    it("drops a malformed email but keeps the row when it has a phone", () => {
        expect(buildImportRow({ First: "Bo", Email: "not-an-email", Phone: "5551234567" }, mapping))
            .toEqual({ first_name: "Bo", phone: "5551234567" });
    });

    it("skips rows with neither a valid email nor a phone", () => {
        expect(buildImportRow({ First: "Cy", Email: "bad", Phone: " " }, mapping)).toBeNull();
    });

    it("produces rows the import API accepts", () => {
        const rows = [
            { First: "Dee", Email: "dee@example.com", Phone: "" },
            { First: "", Email: "", Phone: "+15551234567" },
        ].map((r) => buildImportRow(r, mapping));
        expect(customersImportSchema.safeParse({ customers: rows }).success).toBe(true);
    });
});
