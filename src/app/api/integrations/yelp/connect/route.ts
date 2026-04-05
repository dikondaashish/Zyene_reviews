import { createClient } from "@/lib/db/supabase/server";
import { searchBusiness } from "@/services/yelp/adapter";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";

const connectSchema = z.object({
    businessName: z.string().min(1).max(255),
    location: z.string().min(1).max(255),
});

export async function POST(req: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/integrations/yelp/connect");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    try {
        const parsed = connectSchema.safeParse(await req.json());
        if (!parsed.success) {
            return apiError("Business name and location are required", { status: 400, details: requestId });
        }

        const { businessName, location } = parsed.data;

        const results = await searchBusiness(businessName, location);
        logger.info({ userId: user.id, businessName, location, resultCount: results.length }, "Yelp business search completed");

        return apiOk({ businesses: results, requestId });
    } catch (error: unknown) {
        console.error("[Yelp Connect] Search error:", error);
        return apiError("Internal Server Error", { status: 500, details: requestId });
    }
}
