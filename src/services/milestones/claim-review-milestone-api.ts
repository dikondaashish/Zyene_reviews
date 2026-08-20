import { apiError, apiOk } from "@/app/api/_shared/responses";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { createRequestLogger } from "@/lib/logger";
import { z } from "zod";

import { claimReviewMilestone } from "./claim-review-milestone";

const bodySchema = z.object({ businessId: z.string().uuid() });

export async function handleClaimReviewMilestone(request: Request) {
  const { logger, requestId } = createRequestLogger("POST /api/milestones/reviews/claim");
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return apiError("A valid business ID is required", { status: 400, details: requestId });
    }
    const { businessId } = parsed.data;
    if (!(await userCanAccessBusiness(supabase, user.id, businessId))) {
      return apiError("You don't have access to this business", {
        status: 403,
        details: requestId,
      });
    }

    return apiOk({ milestone: await claimReviewMilestone(supabase, businessId) });
  } catch (error) {
    logger.error({ err: error }, "Review milestone claim failed");
    return apiError("Could not check review milestones", { status: 500, details: requestId });
  }
}
