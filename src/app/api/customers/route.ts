import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { type NextRequest } from "next/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { customerMatchesSearch } from "@/lib/customers/search-match";
import { enrichCustomersWithReviewLinkage } from "@/lib/customers/review-linkage";

const createCustomerSchema = z.object({
    businessId: z.string().uuid(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(30).optional(),
    tags: z.array(z.string().max(50)).optional(),
    notes: z.string().max(2000).optional(),
});

const deleteCustomerSchema = z.object({
    id: z.string().uuid(),
    businessId: z.string().uuid(),
});

const patchCustomerSchema = z.object({
    id: z.string().uuid(),
    businessId: z.string().uuid(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(30).optional(),
    tags: z.array(z.string().max(50)).optional(),
    notes: z.string().max(2000).nullable().optional(),
    is_opted_out: z.boolean().optional(),
}).superRefine((value, ctx) => {
    const hasUpdateField =
        value.firstName !== undefined ||
        value.lastName !== undefined ||
        value.first_name !== undefined ||
        value.last_name !== undefined ||
        value.email !== undefined ||
        value.phone !== undefined ||
        value.tags !== undefined ||
        value.notes !== undefined ||
        value.is_opted_out !== undefined;

    if (!hasUpdateField) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "No valid fields to update",
        });
    }
});

export async function POST(request: NextRequest) {
    const { requestId } = createRequestLogger("POST /api/customers");
    try {
        const supabase = await createClient();

        // Auth check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return apiError("Unauthorized", { status: 401, details: requestId });
        }

        const parsed = createCustomerSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, { status: 400, details: requestId });
        }
        const { businessId, firstName, lastName, email, phone, tags, notes } = parsed.data;

        // Validate input
        if (!email && !firstName && !phone) {
            return apiError("Business ID and at least one contact method (email, phone, or name) are required", { status: 400, details: requestId });
        }

        // Verify user has access to this business
        const hasAccess = await userCanAccessBusiness(supabase, user.id, businessId);

        if (!hasAccess) {
            return apiError("You don't have access to this business", { status: 403, details: requestId });
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
            return apiError(error.message || "Failed to save customer", { status: 400, details: requestId });
        }

        return apiOk(data, { status: 201 });
    } catch (error: unknown) {
        console.error("Error saving customer:", error);
        const message = error instanceof Error ? error.message : "Failed to save customer";
        return apiError(message, { status: 500, details: requestId });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        const businessId = searchParams.get("businessId");
        const searchRaw = searchParams.get("search")?.trim() ?? "";
        const tags = searchParams.get("tags")?.split(",").filter(Boolean);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "5000"), 5000);

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

        // Tag Filtering
        if (tags && tags.length > 0) {
            query = query.contains("tags", tags);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        if (searchRaw) {
            const { data: candidates, error } = await query.order("created_at", { ascending: false });
            if (error) throw error;
            const filtered = (candidates || []).filter((row) => customerMatchesSearch(row, searchRaw));
            const enrichedFiltered = await enrichCustomersWithReviewLinkage(supabase, businessId, filtered);
            const total = enrichedFiltered.length;
            const pageRows = enrichedFiltered.slice(from, Math.min(to + 1, enrichedFiltered.length));
            return apiOk(
                {
                    customers: pageRows,
                    total,
                    page,
                    limit,
                },
                {
                    headers: {
                        "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
                    },
                }
            );
        }

        const { data, count, error } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;

        const enriched = await enrichCustomersWithReviewLinkage(supabase, businessId, data || []);

        return apiOk(
            {
                customers: enriched,
                total: count,
                page,
                limit,
            },
            {
                headers: {
                    "Cache-Control": "private, max-age=30, stale-while-revalidate=120",
                },
            }
        );

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiError(message, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const { requestId } = createRequestLogger("DELETE /api/customers");
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

        const parsed = deleteCustomerSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError("ID and Business ID are required", { status: 400, details: requestId });
        }

        const { id, businessId } = parsed.data;

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return apiError("You don't have access to this business", { status: 403, details: requestId });
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
        return apiError(message, { status: 500, details: requestId });
    }
}

export async function PATCH(request: NextRequest) {
    const { requestId } = createRequestLogger("PATCH /api/customers");
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

        const parsed = patchCustomerSchema.safeParse(await request.json());
        if (!parsed.success) {
            const message = parsed.error.issues[0]?.message || "ID and Business ID are required";
            return apiError(message, { status: 400, details: requestId });
        }

        const {
            id,
            businessId,
            firstName,
            lastName,
            first_name,
            last_name,
            email,
            phone,
            tags,
            notes,
            is_opted_out,
        } = parsed.data;

        const updates: {
            first_name?: string;
            last_name?: string;
            email?: string;
            phone?: string;
            tags?: string[];
            notes?: string | null;
            is_opted_out?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (firstName !== undefined || first_name !== undefined) updates.first_name = firstName ?? first_name;
        if (lastName !== undefined || last_name !== undefined) updates.last_name = lastName ?? last_name;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (tags !== undefined) updates.tags = tags;
        if (notes !== undefined) updates.notes = notes;
        if (is_opted_out !== undefined) updates.is_opted_out = is_opted_out;

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            return apiError("You don't have access to this business", { status: 403, details: requestId });
        }

        const { data, error } = await supabase
            .from("customers")
            .update(updates)
            .eq("id", id)
            .eq("business_id", businessId)
            .select()
            .single();

        if (error) throw error;

        return apiOk(data);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiError(message, { status: 500, details: requestId });
    }
}
