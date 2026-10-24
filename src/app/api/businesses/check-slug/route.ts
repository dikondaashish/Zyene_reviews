
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { NextResponse } from "next/server";
import { sanitizeSlug } from "@/lib/utils";
import { isSlugTakenByAnotherBusiness } from "@/services/businesses/slug-availability";

export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const currentBusinessId = searchParams.get("businessId"); // Optional: exclude current business

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const sanitized = sanitizeSlug(slug);
    if (sanitized.length < 3) {
        return NextResponse.json({ available: false, reason: "Too short" });
    }

    let isTaken: boolean;
    try {
        // Only a real id may be excluded; anything else would make the admin query fail.
        const exclude = /^[0-9a-f-]{36}$/i.test(currentBusinessId ?? "") ? currentBusinessId : null;
        isTaken = await isSlugTakenByAnotherBusiness(sanitized, exclude);
    } catch (error) {
        logger.error({ err: error }, "Error checking slug:");
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
        available: !isTaken,
        sanitized
    });
}
