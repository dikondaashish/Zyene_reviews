import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { buildCloverAuthorizeUrl } from "@/services/clover/oauth";
import { isCloverConfigured } from "@/services/clover/config";
import { randomBytes } from "crypto";

/**
 * GET /api/integrations/clover/connect?businessId=
 * Starts Clover OAuth (sandbox or production per CLOVER_ENV).
 */
export async function GET(request: Request) {
    if (!isCloverConfigured()) {
        return NextResponse.json(
            { error: "Clover is not configured. Set CLOVER_APP_ID and CLOVER_APP_SECRET." },
            { status: 503 },
        );
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const businessId = new URL(request.url).searchParams.get("businessId");
    if (!businessId) {
        return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }

    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = buildCloverAuthorizeUrl({
        businessId,
        userId: user.id,
        nonce: randomBytes(16).toString("hex"),
    });
    return NextResponse.redirect(url);
}
