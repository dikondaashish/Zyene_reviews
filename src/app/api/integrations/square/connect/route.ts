import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { buildSquareAuthorizeUrl } from "@/services/square/oauth";
import { isSquareConfigured } from "@/services/square/config";
import { randomBytes } from "crypto";

/**
 * GET /api/integrations/square/connect?businessId=
 * Starts Square OAuth (sandbox or production per SQUARE_ENV).
 */
export async function GET(request: Request) {
    if (!isSquareConfigured()) {
        return NextResponse.json(
            {
                error: "Square is not configured. Set SQUARE_APPLICATION_ID and SQUARE_APPLICATION_SECRET.",
            },
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

    const url = buildSquareAuthorizeUrl({
        businessId,
        userId: user.id,
        nonce: randomBytes(16).toString("hex"),
    });
    return NextResponse.redirect(url);
}
