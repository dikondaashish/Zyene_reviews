import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { searchBusiness } from "@/lib/yelp/adapter";

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { businessName, location } = await req.json();

        if (!businessName || !location) {
            return NextResponse.json(
                { error: "Business name and location are required" },
                { status: 400 }
            );
        }

        const results = await searchBusiness(businessName, location);

        return NextResponse.json({ businesses: results });
    } catch (error: any) {
        console.error("[Yelp Connect] Search error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to search Yelp" },
            { status: 500 }
        );
    }
}
