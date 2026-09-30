import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { cookies } from "next/headers";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { FB_CONNECT_COOKIE, readFacebookConnectData } from "@/services/facebook/connect-session";

/**
 * GET: Returns the list of Facebook pages from the fb_connect_data cookie.
 * This is called by the FacebookIntegrationCard after OAuth callback redirect.
 */
export async function GET() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const nonce = cookieStore.get(FB_CONNECT_COOKIE)?.value;
    if (!nonce) {
        return NextResponse.json(
            { error: "No Facebook connection data found. Please reconnect." },
            { status: 400 }
        );
    }

    try {
        const fbData = await readFacebookConnectData(nonce);
        if (!fbData || fbData.userId !== user.id ||
            !(await canManageBusinessIntegration(supabase, user.id, fbData.businessId))) {
            return NextResponse.json({ error: "Connection data unavailable" }, { status: 403 });
        }
        return NextResponse.json({
            businessId: fbData.businessId,
            pages: fbData.pages.map(({ pageId, pageName }) => ({ pageId, pageName })),
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid connection data" },
            { status: 400 }
        );
    }
}
