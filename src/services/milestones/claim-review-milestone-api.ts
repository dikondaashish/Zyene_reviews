import { apiError, apiOk } from "@/app/api/_shared/responses";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { createRequestLogger } from "@/lib/logger";
import { z } from "zod";

import { ClaimReviewMilestoneError, claimReviewMilestone } from "./claim-review-milestone";

const bodySchema = z.object({ businessId: z.string().uuid() });

async function parseBody(request: Request) {
  try {
    return bodySchema.safeParse(await request.json());
  } catch {
    return { success: false as const };
  }
}

export async function handleClaimReviewMilestone(request: Request) {
  const { logger, requestId } = createRequestLogger("POST /api/milestones/reviews/claim");
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    const parsed = await parseBody(request);
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

    try {
      return apiOk({ milestone: await claimReviewMilestone(supabase, businessId) });
    } catch (error) {
      if (error instanceof ClaimReviewMilestoneError && error.kind === "unavailable") {
        logger.warn({ err: error }, "Review milestone RPC unavailable");
        return apiOk({ milestone: null });
      }
      if (error instanceof ClaimReviewMilestoneError && error.kind === "forbidden") {
        return apiError("You don't have access to this business", {
          status: 403,
          details: requestId,
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error({ err: error }, "Review milestone claim failed");
    return apiError("Could not check review milestones", { status: 500, details: requestId });
  }
}
