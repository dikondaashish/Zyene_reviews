import { normalizeCustomerEmail, normalizeCustomerPhone } from "@/lib/customers/identity";

/**
 * Validates and de-duplicates enrollment rows for a campaign channel. Pure: the browser
 * uses it for the preview and the server re-runs it on upload, so both always agree.
 */
export type RawImportRow = { name?: string | null; phone?: string | null; email?: string | null };
export type ImportRowStatus = "pending" | "invalid" | "duplicate";
export type ValidatedImportRow = {
    rowNumber: number;
    customerName: string | null;
    phone: string | null;
    email: string | null;
    identityKey: string | null;
    status: ImportRowStatus;
    reason: string | null;
};

export const MAX_IMPORT_ROWS = 5000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanPhone(raw: string | null | undefined): string | null {
    const digits = (raw ?? "").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) return null;
    return normalizeCustomerPhone(raw);
}

export function validateImportRows(rows: RawImportRow[], channel: "sms" | "email" | "both"): ValidatedImportRow[] {
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    return rows.slice(0, MAX_IMPORT_ROWS).map((row, index) => {
        const customerName = (row.name ?? "").trim().slice(0, 200) || null;
        const rawEmail = (row.email ?? "").trim();
        const rawPhone = (row.phone ?? "").trim();
        const email = rawEmail && EMAIL.test(rawEmail) ? normalizeCustomerEmail(rawEmail) : null;
        const phone = rawPhone ? cleanPhone(rawPhone) : null;
        const base = { rowNumber: index + 1, customerName, phone, email, identityKey: email ?? phone };

        const reasons: string[] = [];
        if (rawEmail && !email) reasons.push("Email address is not valid");
        if (rawPhone && !phone) reasons.push("Phone number is not valid");
        const usable = channel === "sms" ? Boolean(phone) : channel === "email" ? Boolean(email) : Boolean(phone || email);
        if (!usable) {
            reasons.push(channel === "sms" ? "This campaign sends texts; add a phone number" : channel === "email"
                ? "This campaign sends email; add an email address" : "Add a phone number or email address");
            return { ...base, status: "invalid" as const, reason: reasons.join("; ") };
        }
        if ((email && seenEmails.has(email)) || (phone && seenPhones.has(phone))) {
            return { ...base, status: "duplicate" as const, reason: "Same contact appears earlier in this file" };
        }
        if (email) seenEmails.add(email);
        if (phone) seenPhones.add(phone);
        return { ...base, status: "pending" as const, reason: reasons.length ? reasons.join("; ") : null };
    });
}

export function summarizeImportRows(rows: ValidatedImportRow[]) {
    return {
        total: rows.length,
        valid: rows.filter((r) => r.status === "pending").length,
        invalid: rows.filter((r) => r.status === "invalid").length,
        duplicate: rows.filter((r) => r.status === "duplicate").length,
    };
}
