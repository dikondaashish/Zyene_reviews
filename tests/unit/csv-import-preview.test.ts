import { expect, it } from "vitest";
import { prepareCsvImport } from "@/lib/customers/prepare-csv-import";
it("accepts phone-only contacts and omits missing optional fields", () => {
    expect(prepareCsvImport([{ phone: "+12125550123" }])).toEqual([{ phone: "+12125550123", first_name: undefined, last_name: undefined, email: undefined }]);
});
it("rejects rows without a delivery address and invalid emails before upload", () => {
    expect(() => prepareCsvImport([{ name: "Alex" }])).toThrow("Row 2");
    expect(() => prepareCsvImport([{ email: "invalid" }])).toThrow("CSV fields");
});
