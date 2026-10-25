import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AEO tests are prepaid: the only money that moves is a customer-initiated
 * Checkout for "Add balance". Before 2026-10-14 the dispatch worker created a
 * $2.50 InvoiceItem per test past plan credit. On API 2026-02-25.clover that
 * left an empty $0 invoice per test and parked the item on the next
 * subscription invoice, which is how Vindu (5SGMYP6P-0028) and Precise Duct
 * (KC7D0LEU-0014) were billed overage. This guard keeps any automatic charge
 * path from coming back into the AEO code without a deliberate decision.
 */
const ROOTS = [
    "src/services/aeo",
    "src/services/inngest/aeo",
    "src/app/(dashboard)/google-seo-aeo",
    "src/app/api/aeo",
];

/** The only AEO file allowed to talk to Stripe: a customer-started one-time Checkout. */
const STRIPE_CLIENT_ALLOWLIST = new Set(["src/services/aeo/billing/topup-checkout-api.ts"]);

const CHARGE_CALLS =
    /\b(invoiceItems|subscriptionItems|meterEvents|meterEventStream|paymentIntents|charges)\s*\.\s*create\b|\binvoices\s*\.\s*(create|pay|finalizeInvoice)\b|\bbilling\s*\.\s*meter/;

function sourceFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return sourceFiles(full);
        return /\.(ts|tsx)$/.test(entry.name) ? [full.split(path.sep).join("/")] : [];
    });
}

const files = ROOTS.flatMap(sourceFiles);

describe("AEO billing never charges a card automatically", () => {
    it("scans a non-empty set of AEO source files", () => {
        expect(files.length).toBeGreaterThan(20);
    });

    it("imports the Stripe client only from the top-up checkout", () => {
        const importers = files.filter((file) =>
            /from\s+["']@\/services\/stripe\/client["']/.test(fs.readFileSync(file, "utf8"))
        );
        expect(importers.filter((file) => !STRIPE_CLIENT_ALLOWLIST.has(file))).toEqual([]);
    });

    it("creates no invoice, invoice item, meter event or direct charge", () => {
        const offenders = files.filter((file) => CHARGE_CALLS.test(fs.readFileSync(file, "utf8")));
        expect(offenders).toEqual([]);
    });
});
