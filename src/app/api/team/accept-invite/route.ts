import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";
import { acceptBusinessInvitationAdmin } from "@/lib/auth/accept-business-invitation";

const bodySchema = z.object({
    /** Invite `token` (hex) or invitation row `id` (UUID). */
    token: z.string().min(10),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const admin = createAdminClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiError("Unauthorized", { status: 401 });

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return apiError("Invalid token", { status: 400 });

    const result = await acceptBusinessInvitationAdmin({
        admin,
        userId: user.id,
        userEmail: user.email,
        inviteParam: parsed.data.token,
    });

    if (!result.accepted) {
        return apiError("Invite not found, expired, or email does not match this account", { status: 400 });
    }

    return apiOk({ accepted: true, business_id: result.businessId });
}
