import { createClient } from "@/lib/db/supabase/server";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { loadActiveBillingMember } from "@/lib/billing/active-billing-member";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { loadAeoBalance } from "./aeo-balance";

export type AeoBalanceResponse =
    | { live: false }
    | {
          live: true;
          planMicroUsd: number;
          planGrantedMicroUsd: number;
          purchasedMicroUsd: number;
          totalMicroUsd: number;
          testsRemaining: number;
          canTopUp: boolean;
      };

/** GET /api/aeo/balance - the active organization's prepaid AEO balance, for the header pill. */
export async function handleAeoBalance() {
    const { logger, requestId } = createRequestLogger("GET /api/aeo/balance");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    if (!isMeteredBillingLive()) return apiOk<AeoBalanceResponse>({ live: false });

    try {
        const membership = await loadActiveBillingMember(user.id);
        if (membership.kind !== "ok" || !membership.member) {
            return apiError("No active organization found", { status: 404, details: requestId });
        }
        // Read through the caller's RLS-scoped client: aeo_credit_balances'
        // select policy is the tenant boundary, not the membership lookup above.
        const balance = await loadAeoBalance(supabase, membership.member.organization_id);
        return apiOk<AeoBalanceResponse>({
            live: true,
            ...balance,
            canTopUp: isOrganizationOwnerRole(membership.member.role),
        });
    } catch (err) {
        logger.error({ err, requestId }, "Failed to load AEO balance");
        return apiError("Unable to load balance", { status: 500, details: requestId });
    }
}
