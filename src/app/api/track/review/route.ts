import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, requestId, trackData } = body;

        // Use the admin client to bypass RLS securely on the server
        const supabase = createAdminClient();

        if (action === "update" && requestId) {
            const { error } = await supabase
                .from("review_requests")
                .update(trackData)
                .eq("id", requestId);

            if (error) throw error;
        } else if (action === "insert") {
            const { error } = await supabase
                .from("review_requests")
                .insert(trackData);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Tracking error:", error);
        return NextResponse.json({ error: "Failed to track review" }, { status: 500 });
    }
}
