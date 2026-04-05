import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { type NextRequest } from "next/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";

const createCustomerSchema = z.object({
    businessId: z.string().uuid(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(30).optional(),
    tags: z.array(z.string().max(50)).optional(),
    notes: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Auth check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return apiError("Unauthorized", { status: 401 });
        }

        const parsed = createCustomerSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.errors[0].message, { status: 400 });
        }
        const { businessId, firstName, lastName, email, phone, tags, notes } = parsed.data;

        // Validate input
        if (!email && !firstName && !phone) {
            return apiError("Business ID and at least one contact method (email, phone, or name) are required", { status: 400 });
        }

        // Verify user has access to this business
        const { userCanAccessBusiness } = await import("@/lib/db/supabase/verify-business-access");
        const hasAccess = await userCanAccessBusiness(supabase, user.id, businessId);

        if (!hasAccess) {
            return apiError("You don't have access to this business", { status: 403 });
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
            return apiError(error.message || "Failed to save customer", { status: 400 });
        }

        return apiOk(data, { status: 201 });
    } catch (error: unknown) {
        console.error("Error saving customer:", error);
        const message = error instanceof Error ? error.message : "Failed to save customer";
        return apiError(message, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const businessId = searchParams.get("businessId");
        const search = searchParams.get("search")?.toLowerCase();
        const tags = searchParams.get("tags")?.split(",").filter(Boolean);
        const segment = searchParams.get("segment");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");

        if (!businessId) {
            return apiError("Business ID is required", { status: 400 });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return apiError("You don't have access to this business", { status: 403 });
        }

        let query = supabase
            .from("customers")
            .select("*", { count: "exact" })
            .eq("business_id", businessId);

        // Text Search — sanitize to prevent PostgREST filter injection
        if (search) {
            const sanitized = search.replace(/[%_\\]/g, "\\$&").slice(0, 100);
            query = query.or(`first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%`);
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

        return apiOk({
            customers: data,
            total: count,
            page,
            limit
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiError(message, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { status: 401 });

        const { id, businessId } = await request.json();

        if (!id || !businessId) {
            return apiError("ID and Business ID are required", { status: 400 });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return apiError("You don't have access to this business", { status: 403 });
        }

        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", id)
            .eq("business_id", businessId);

        if (error) throw error;

        return apiOk({ deleted: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiError(message, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { status: 401 });

        const { id, businessId, ...updates } = await request.json();

        if (!id || !businessId) {
            return apiError("ID and Business ID are required", { status: 400 });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return apiError("You don't have access to this business", { status: 403 });
        }

        const { data, error } = await supabase
            .from("customers")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("business_id", businessId)
            .select()
            .single();

        if (error) throw error;

        return apiOk(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiError(message, { status: 500 });
    }
}
