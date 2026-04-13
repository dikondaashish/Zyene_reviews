import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";

const bodySchema = z.object({
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

    const invitationsTable = admin.from("invitations" as never);
    const inviteResult = await invitationsTable
        .select("id, email, role, business_id, organization_id, expires_at, accepted_at")
        .eq("token", parsed.data.token)
        .is("accepted_at", null)
        .maybeSingle();
    const invite = inviteResult.data as
        | {
              id: string;
              email: string;
              role: string;
              business_id: string | null;
              organization_id: string;
              expires_at: string | null;
          }
        | null;

    if (!invite) return apiError("Invite not found or already accepted", { status: 404 });
    if (!user.email || invite.email.toLowerCase() !== user.email.toLowerCase()) {
        return apiError("Invite email does not match this account", { status: 403 });
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return apiError("Invite expired", { status: 410 });
    }

    let businessId = invite.business_id;
    if (!businessId) {
        const { data: firstBusiness } = await admin
            .from("businesses")
            .select("id")
            .eq("organization_id", invite.organization_id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
        businessId = firstBusiness?.id ?? null;
    }

    if (!businessId) return apiError("No business found for invite", { status: 400 });

    const role = ["owner", "admin", "manager", "member", "viewer"].includes(invite.role)
        ? invite.role
        : "member";

    await admin.from("business_members").upsert(
        {
            business_id: businessId,
            user_id: user.id,
            role,
            status: "active",
        },
        { onConflict: "business_id,user_id" }
    );

    await (invitationsTable as any)
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

    return apiOk({ accepted: true, business_id: businessId });
}
