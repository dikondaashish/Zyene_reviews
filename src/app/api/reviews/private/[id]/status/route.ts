import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { z } from "zod";

const statusSchema = z.object({
    status: z.enum(["open", "contacted", "resolved"]),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = statusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("private_feedback")
            .update({ status: parsed.data.status })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Failed to update status:", error);
            return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Status Update API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
