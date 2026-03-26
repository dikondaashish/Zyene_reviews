import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { listAccounts, listLocations } from "@/services/google/business-profile";
import { listAccountAdmins } from "@/services/google/account-management";
import { type NextRequest } from "next/server";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";

export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await requireUser();
        const businessId = request.nextUrl.searchParams.get("businessId");
        if (!businessId) {
            throw new ApiRouteError("businessId required", { status: 400, code: "MISSING_BUSINESS_ID" });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .select("id, google_account_id, google_location_id, platform")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .eq("sync_status", "active")
            .maybeSingle();

        if (error || !platform?.google_location_id) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        const accounts = await listAccounts(accessToken);
        const accountSummaries: Array<{
            resourceName: string;
            accountName: string;
            type?: string;
            verificationState?: string;
            locationCount: number;
            locations: Array<{ name: string; title: string }>;
            isLinkedToZyene: boolean;
        }> = [];

        const linkedAccountId = platform.google_account_id as string | null;
        const linkedLocId = platform.google_location_id as string;

        for (const acc of accounts.slice(0, 8)) {
            const resourceName = acc.name;
            const rawAccountId = resourceName.replace(/^accounts\//, "");
            let locations: { name: string; title: string }[] = [];
            try {
                const locs = await listLocations(accessToken, resourceName);
                locations = locs.map((l) => ({
                    name: l.name,
                    title: l.title || l.name,
                }));
            } catch {
                /* skip account if locations fail */
            }

            const matchesLinkedLocation = (locName: string) =>
                locName === `locations/${linkedLocId}` || locName.endsWith(`/locations/${linkedLocId}`);

            const isLinked =
                !!linkedAccountId &&
                rawAccountId === linkedAccountId &&
                locations.some((l) => matchesLinkedLocation(l.name));

            accountSummaries.push({
                resourceName,
                accountName: acc.accountName || rawAccountId,
                type: acc.type,
                verificationState: acc.verificationState,
                locationCount: locations.length,
                locations: locations.slice(0, 25),
                isLinkedToZyene: isLinked,
            });
        }

        let admins: Awaited<ReturnType<typeof listAccountAdmins>> = [];
        if (linkedAccountId) {
            try {
                admins = await listAccountAdmins(accessToken, `accounts/${linkedAccountId}`);
            } catch {
                admins = [];
            }
        }

        return apiOk({
            accounts: accountSummaries,
            admins: admins.map((a) => ({
                name: a.name,
                admin: a.admin,
                role: a.role,
                pendingInvitation: a.pendingInvitation,
            })),
            linkedAccountId,
            linkedLocationId: linkedLocId,
        });
    } catch (e: unknown) {
        const normalized = toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
