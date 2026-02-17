
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sanitizeSlug } from "@/lib/utils";

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

    let query = supabase
        .from("businesses")
        .select("id")
        .eq("slug", sanitized);

    if (currentBusinessId) {
        query = query.neq("id", currentBusinessId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== "PGRST116") { // PGRST116 means no rows found (which is good)
        console.error("Error checking slug:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // If data exists, it's taken. If error (no rows), it's available.
    const isTaken = !!data;

    return NextResponse.json({
        available: !isTaken,
        sanitized
    });
}
