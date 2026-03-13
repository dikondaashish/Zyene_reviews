import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Auth check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { businessId, firstName, lastName, email, phone, tags } = await request.json();

        // Validate input
        if (!businessId || (!email && !firstName)) {
            return NextResponse.json(
                { error: "Business ID and either email or first name are required" },
                { status: 400 }
            );
        }

        // Verify user has access to this business
        const { data: businessMember } = await supabase
            .from("business_members")
            .select("role")
            .eq("business_id", businessId)
            .eq("user_id", user.id)
            .single();

        if (!businessMember) {
            return NextResponse.json(
                { error: "You don't have access to this business" },
                { status: 403 }
            );
        }

        // Insert customer
        const { data, error } = await supabase
            .from("customers")
            .insert({
                business_id: businessId,
                first_name: firstName || null,
                last_name: lastName || null,
                email: email || null,
                phone: phone || null,
                tags: tags || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to add customer" },
                { status: 400 }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("Error adding customer:", error);
        return NextResponse.json(
            { error: error.message || "Failed to add customer" },
            { status: 500 }
        );
    }
}
