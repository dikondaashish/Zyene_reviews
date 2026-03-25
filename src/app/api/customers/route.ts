import { createClient } from "@/lib/supabase/server";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Auth check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { businessId, firstName, lastName, email, phone, tags, notes } = await request.json();

        // Validate input
        if (!businessId || (!email && !firstName && !phone)) {
            return NextResponse.json(
                { error: "Business ID and at least one contact method (email, phone, or name) are required" },
                { status: 400 }
            );
        }

        // Verify user has access to this business (either via business_members or organization_members)
        const { data: access, error: accessError } = await supabase
            .from("businesses")
            .select(`
                id,
                organizations!inner (
                    organization_members!inner (
                        user_id
                    )
                )
            `)
            .eq("id", businessId)
            .eq("organizations.organization_members.user_id", user.id)
            .single();

        if (accessError || !access) {
            // Fallback: check business_members specifically (though usually redundant if they are org members)
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
        }

        // Insert customer with conflict resolution (upsert)
        const { data, error } = await supabase
            .from("customers")
            .upsert({
                business_id: businessId,
                first_name: firstName || null,
                last_name: lastName || null,
                email: email || null,
                phone: phone || null,
                tags: tags || [],
                notes: notes || null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'business_id,email',
                ignoreDuplicates: false // We want to update in case of re-import
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to save customer" },
                { status: 400 }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("Error saving customer:", error);
        return NextResponse.json(
            { error: error.message || "Failed to save customer" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const businessId = searchParams.get("businessId");
        const search = searchParams.get("search")?.toLowerCase();
        const tags = searchParams.get("tags")?.split(",").filter(Boolean);
        const segment = searchParams.get("segment");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");

        if (!businessId) {
            return NextResponse.json({ error: "Business ID is required" }, { status: 400 });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return NextResponse.json(
                { error: "You don't have access to this business" },
                { status: 403 }
            );
        }

        let query = supabase
            .from("customers")
            .select("*", { count: "exact" })
            .eq("business_id", businessId);

        // Text Search
        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        // Tag Filtering
        if (tags && tags.length > 0) {
            query = query.contains("tags", tags);
        }

        // Predefined Segments
        if (segment) {
            switch (segment) {
                case "high-value":
                    query = query.gte("total_spend_cents", 50000); // Ex: Over $500
                    break;
                case "loyal":
                    query = query.gte("visit_count", 5);
                    break;
                case "needs-request":
                    query = query.is("last_request_sent_at", null);
                    break;
                case "recent":
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    query = query.gte("created_at", thirtyDaysAgo.toISOString());
                    break;
            }
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;

        return NextResponse.json({
            customers: data,
            total: count,
            page,
            limit
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, businessId } = await request.json();

        if (!id || !businessId) {
            return NextResponse.json({ error: "ID and Business ID are required" }, { status: 400 });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return NextResponse.json(
                { error: "You don't have access to this business" },
                { status: 403 }
            );
        }

        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", id)
            .eq("business_id", businessId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, businessId, ...updates } = await request.json();

        if (!id || !businessId) {
            return NextResponse.json({ error: "ID and Business ID are required" }, { status: 400 });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return NextResponse.json(
                { error: "You don't have access to this business" },
                { status: 403 }
            );
        }

        const { data, error } = await supabase
            .from("customers")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("business_id", businessId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
