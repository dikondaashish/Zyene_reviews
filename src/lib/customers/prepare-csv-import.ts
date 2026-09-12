import { customersImportSchema } from "@/services/customers/import-schema";

type CsvRow = Record<string, string | undefined>;
export function prepareCsvImport(rows: CsvRow[]) {
    if (rows.length > 5000) throw new Error("Maximum 5,000 customers per import. Split your file and try again.");
    const customers = rows.map((row, index) => {
        const name = (row.name || "").trim().split(/\s+/);
        const customer = {
            first_name: row.first_name?.trim() || name[0] || undefined,
            last_name: row.last_name?.trim() || name.slice(1).join(" ") || undefined,
            email: row.email?.trim() || undefined,
            phone: row.phone?.trim() || undefined,
        };
        if (!customer.email && !customer.phone) throw new Error(`Row ${index + 2}: add an email or phone number.`);
        return customer;
    });
    const parsed = customersImportSchema.safeParse({ customers });
    if (!parsed.success) throw new Error(`Check the CSV fields: ${parsed.error.issues[0]?.message || "Invalid customer data"}`);
    return parsed.data.customers;
}
