import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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
    const fbDataRaw = cookieStore.get("fb_connect_data")?.value;

    if (!fbDataRaw) {
        return NextResponse.json(
            { error: "No Facebook connection data found. Please reconnect." },
            { status: 400 }
        );
    }

    try {
        const fbData = JSON.parse(fbDataRaw);
        return NextResponse.json({
            businessId: fbData.businessId,
            pages: fbData.pages,
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid connection data" },
            { status: 400 }
        );
    }
}
