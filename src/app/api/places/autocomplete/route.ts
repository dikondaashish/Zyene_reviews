import { createClient } from "@/lib/db/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { searchPlacesAutocomplete } from "@/services/places/places-autocomplete";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return searchPlacesAutocomplete(request);
}
