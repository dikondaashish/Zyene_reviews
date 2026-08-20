import { apiError, apiOk } from "@/app/api/_shared/responses";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { createRequestLogger } from "@/lib/logger";
import { z } from "zod";

import { mergeCustomers } from "./customer-identity-store";

const mergeSchema = z.object({
  businessId: z.string().uuid(),
  primaryCustomerId: z.string().uuid(),
  duplicateCustomerId: z.string().uuid(),
}).refine((value) => value.primaryCustomerId !== value.duplicateCustomerId, {
  message: "Choose two different customers",
});

export async function handleMergeCustomers(request: Request) {
  const { logger, requestId } = createRequestLogger("POST /api/customers/merge");
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    const parsed = mergeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid merge", {
        status: 400,
        details: requestId,
      });
    }
    const { businessId, primaryCustomerId, duplicateCustomerId } = parsed.data;
    if (!(await userCanAccessBusiness(supabase, user.id, businessId))) {
      return apiError("You don't have access to this business", {
        status: 403,
        details: requestId,
      });
    }

    const customer = await mergeCustomers(
      supabase,
      businessId,
      primaryCustomerId,
      duplicateCustomerId,
    );
    return apiOk({ customer, removedCustomerId: duplicateCustomerId });
  } catch (error) {
    logger.error({ err: error }, "Customer merge failed");
    return apiError("Could not merge these customer records", { status: 400, details: requestId });
  }
}
