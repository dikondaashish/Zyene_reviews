import { z } from "zod";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { createClient } from "@/lib/db/supabase/server";
import { loadActiveBillingMember } from "@/lib/billing/active-billing-member";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { logger } from "@/lib/logger";
import { loadVisibleBillingInvoices } from "@/services/stripe/visible-invoices";
import type { BillingInvoicesPage } from "@/types/billing-invoices";

const querySchema = z.strictObject({
    starting_after: z.string().max(255).regex(/^in_[A-Za-z0-9]+(?::trial)?$/).optional(),
});
const privateResponse = { headers: { "Cache-Control": "private, no-store" } };

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

        const page = await loadVisibleBillingInvoices(org.stripe_customer_id, query.data.starting_after);
        return apiOk({
            organizationId: org.id, ...page,
        } satisfies BillingInvoicesPage, privateResponse);
    } catch (err) {
        logger.error({ err }, "Could not load billing invoices");
        return apiError("Unable to load invoices. Please try again.", { ...privateResponse, status: 500, code: "INVOICES_ERROR" });
    }
}
