"use server";

import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canManageCompetitors } from "@/lib/competitors/watch-access";
import { applyGooglePlacesMetricsToCompetitor } from "@/lib/competitors/apply-google-places-metrics";
import { isCompetitorOwnBusiness } from "@/lib/competitors/own-business-guard";

// Validation schema
const addCompetitorSchema = z.object({
    businessId: z.string().uuid("Invalid business ID"),
    name: z.string()
        .min(1, "Competitor name is required")
        .min(2, "Name must be at least 2 characters")
        .max(255, "Name must be less than 255 characters"),
    googleUrl: z.string()
        .optional()
        .refine(
            (url) => {
                if (!url) return true; // Optional field
                try {
                    const urlObj = new URL(url);
                    return (
                        urlObj.hostname.includes("google.com") || 
                        urlObj.hostname.includes("maps.google.com")
                    );
                } catch {
                    return false;
                }
            },
            "URL must be a valid Google Maps link (e.g., https://maps.google.com/...)"
        ),
});

type AddCompetitorInput = z.infer<typeof addCompetitorSchema>;

export async function addCompetitor(
    businessId: string,
    name: string,
    googleUrl?: string
): Promise<{ success: boolean; data?: any; error?: string; fieldError?: { field: string; message: string } }> {
    try {
        // Validate input with zod
        const validationResult = await addCompetitorSchema.safeParseAsync({
            businessId,
            name,
            googleUrl,
        });

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0];
            // Check if it's a field-level error
            if (firstError.path.length > 0) {
                return {
                    success: false,
                    fieldError: {
                        field: firstError.path[0] as string,
                        message: firstError.message,
                    },
                };
            }
            return {
                success: false,
                error: validationResult.error.issues[0].message,
            };
        }

        const supabase = await createClient();

        // Auth check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return {
                success: false,
                error: "You are not authenticated. Please log in and try again.",
            };
        }

        // Check business membership
        const { data: member, error: memberError } = await supabase
            .from("business_members")
            .select("role")
            .eq("business_id", businessId)
            .eq("user_id", user.id)
            .single();

        if (memberError || !member) {
            return {
                success: false,
                error: "You don't have access to this business.",
            };
        }

        if (!canManageCompetitors(member.role)) {
            return {
                success: false,
                error: "You don't have permission to add competitors for this business.",
            };
        }

        const { data: ownBiz } = await supabase
            .from("businesses")
            .select("name, google_review_url")
            .eq("id", businessId)
            .single();

        const { data: ownGooglePlatform } = await supabase
            .from("review_platforms")
            .select("external_url, google_location_id")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .maybeSingle();

        if (
            isCompetitorOwnBusiness(
                {
                    businessName: ownBiz?.name ?? "",
                    googleUrls: [ownBiz?.google_review_url, ownGooglePlatform?.external_url],
                    googleLocationId: ownGooglePlatform?.google_location_id,
                },
                validationResult.data.name,
                validationResult.data.googleUrl || null
            )
        ) {
            return {
                success: false,
                error: "You can’t add your own business as a competitor. Track other locations instead.",
            };
        }

        // Insert competitor
        const { data, error } = await supabase
            .from("competitors")
            .insert({
                business_id: businessId,
                name: name.trim(),
                google_url: googleUrl || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Database error adding competitor:", error);
            if (error.code === "23505") {
                // Unique constraint violation
                return {
                    success: false,
                    error: "This competitor is already being tracked.",
                };
            }
            return {
                success: false,
                error: "Failed to add competitor. Please try again.",
            };
        }

        // Try Google Places first so ratings/reviews populate without waiting for cron.
        try {
            const row = data as {
                id: string;
                business_id: string;
                name: string;
                google_url: string | null;
                average_rating: number | null;
                total_reviews: number | null;
            };
            const applied = await applyGooglePlacesMetricsToCompetitor(supabase, {
                id: row.id,
                business_id: businessId,
                name: row.name,
                google_url: googleUrl || null,
                average_rating: row.average_rating,
                total_reviews: row.total_reviews,
            });

            if (!applied.metrics) {
                await supabase.from("competitor_snapshots" as never).insert({
                    competitor_id: row.id,
                    business_id: businessId,
                    average_rating: 0,
                    total_reviews: 0,
                    source: "manual",
                    metadata: { seeded_on_create: true, note: "Places lookup unavailable — use Sync or wait for cron" },
                } as never);
            }

            await supabase.from("competitor_events" as never).insert({
                competitor_id: row.id,
                business_id: businessId,
                event_type: "competitor.added",
                title: "Competitor added",
                summary: `${name.trim()} was added to competitor watch.`,
                metadata: { google_url: googleUrl || null },
            } as never);
        } catch (historyError) {
            console.error("Failed to write competitor snapshot/event:", historyError);
        }

        revalidatePath("/competitors");
        return {
            success: true,
            data,
        };
    } catch (error: unknown) {
        console.error("Unexpected error adding competitor:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

export async function deleteCompetitor(
    id: string,
    businessId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return {
                success: false,
                error: "You are not authenticated.",
            };
        }

        // Check business membership
        const { data: member, error: memberError } = await supabase
            .from("business_members")
            .select("role")
            .eq("business_id", businessId)
            .eq("user_id", user.id)
            .single();

        if (memberError || !member) {
            return {
                success: false,
                error: "You don't have access to this business.",
            };
        }

        if (!canManageCompetitors(member.role)) {
            return {
                success: false,
                error: "You don't have permission to remove competitors.",
            };
        }

        const { data: businessRow } = await supabase
            .from("businesses")
            .select("organization_id")
            .eq("id", businessId)
            .maybeSingle();
        const organizationId = businessRow?.organization_id ?? null;

        try {
            if (organizationId) {
                await supabase.from("events").insert({
                    organization_id: organizationId,
                    business_id: businessId,
                    user_id: user.id,
                    event_type: "competitor.removed",
                    entity_type: "competitor",
                    entity_id: id,
                    metadata: {},
                });
            }
        } catch (eventError) {
            console.error("Failed to write competitor removal audit event:", eventError);
        }

        const { error } = await supabase
            .from("competitors")
            .delete()
            .eq("id", id)
            .eq("business_id", businessId);

        if (error) {
            console.error("Database error deleting competitor:", error);
            return {
                success: false,
                error: "Failed to remove competitor. Please try again.",
            };
        }

        revalidatePath("/competitors");
        return { success: true };
    } catch (error: unknown) {
        console.error("Unexpected error deleting competitor:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}
