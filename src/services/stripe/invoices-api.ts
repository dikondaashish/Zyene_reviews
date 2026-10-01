import { z } from "zod";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { createClient } from "@/lib/db/supabase/server";
import { loadActiveBillingMember } from "@/lib/billing/active-billing-member";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";
import { stripeInvoiceUrlSchema, type BillingInvoicesPage } from "@/types/billing-invoices";

const querySchema = z.strictObject({
    starting_after: z.string().max(255).regex(/^in_[A-Za-z0-9]+$/).optional(),
});
const privateResponse = { headers: { "Cache-Control": "private, no-store" } };
const safeUrl = (value: string | null | undefined) => stripeInvoiceUrlSchema.safeParse(value).data ?? null;
const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string) {
    let formatter = currencyFormatters.get(currency);
    if (!formatter) {
        formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
        currencyFormatters.set(currency, formatter);
    }
    return formatter;
}

export async function handleBillingInvoices(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { ...privateResponse, status: 401, code: "UNAUTHORIZED" });

        const query = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
        if (!query.success) return apiError("Invalid invoice request", { ...privateResponse, status: 400, code: "INVALID_INPUT" });

        const membership = await loadActiveBillingMember(user.id);
        const member = membership.kind === "ok" ? membership.member : null;
        const org = member?.organizations;
        if (!member || !org || org.id !== member.organization_id) {
            return apiError("No billing organization found", { ...privateResponse, status: 404, code: "NOT_FOUND" });
        }
        if (!isOrganizationOwnerRole(member.role)) {
            return apiError("You don't have permission to view invoices", { ...privateResponse, status: 403, code: "FORBIDDEN" });
        }
        if (!org.stripe_customer_id) {
            return apiOk({ organizationId: org.id, invoices: [], nextCursor: null } satisfies BillingInvoicesPage, privateResponse);
        }

        const page = await stripe.invoices.list({ customer: org.stripe_customer_id, limit: 10, ...query.data });
        const invoices = page.data.map((invoice) => {
            const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
            if (customerId !== org.stripe_customer_id) throw new Error("Invoice customer binding mismatch");
            const formatter = getCurrencyFormatter(invoice.currency);
            const fractionDigits = ["isk", "ugx"].includes(invoice.currency) ? 2 : formatter.resolvedOptions().maximumFractionDigits ?? 2;
            return {
                id: invoice.id, number: invoice.number, createdAt: new Date(invoice.created * 1000).toISOString(),
                amount: formatter.format(invoice.total / 10 ** fractionDigits), status: invoice.status ?? "draft",
                pdfUrl: safeUrl(invoice.invoice_pdf), hostedUrl: safeUrl(invoice.hosted_invoice_url),
            };
        });
        return apiOk({
            organizationId: org.id, invoices,
            nextCursor: page.has_more ? page.data.at(-1)?.id ?? null : null,
        } satisfies BillingInvoicesPage, privateResponse);
    } catch (err) {
        logger.error({ err }, "Could not load billing invoices");
        return apiError("Unable to load invoices. Please try again.", { ...privateResponse, status: 500, code: "INVOICES_ERROR" });
    }
}
