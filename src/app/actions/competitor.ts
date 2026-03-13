"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

        if (member.role !== 'owner' && member.role !== 'admin') {
            return {
                success: false,
                error: "You don't have permission to add competitors for this business.",
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

        revalidatePath("/competitors");
        return {
            success: true,
            data,
        };
    } catch (error: any) {
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

        if (member.role !== 'owner' && member.role !== 'admin') {
            return {
                success: false,
                error: "You don't have permission to remove competitors.",
            };
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
    } catch (error: any) {
        console.error("Unexpected error deleting competitor:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}
