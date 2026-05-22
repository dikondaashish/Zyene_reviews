import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { buildReferralSignupUrl } from "@/lib/growth/referral";

export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referralUrl = buildReferralSignupUrl(user.id);

    const admin = createAdminClient();
    const { count } = await admin
        .from("referral_conversions")
        .select("id", { count: "exact", head: true })
        .eq("referrer_user_id", user.id)
        .in("status", ["converted", "rewarded"]);

    return NextResponse.json({
        referralUrl,
        successfulReferrals: count ?? 0,
        referrerReward: "1 free month credit per paying referral",
        refereeReward: "14-day free trial (instead of 7)",
    });
}
