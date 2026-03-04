"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCompetitor(businessId: string, name: string, googleUrl?: string) {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Basic verification - check if user has access to business
    const { data: member } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .single();

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new Error("Insufficient permissions");
    }

    const { data, error } = await supabase
        .from("competitors")
        .insert({
            business_id: businessId,
            name,
            google_url: googleUrl || null
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding competitor:", error);
        throw new Error(error.message);
    }

    revalidatePath("/competitors");
    return data;
}

export async function deleteCompetitor(id: string, businessId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: member } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .single();

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new Error("Insufficient permissions");
    }

    const { error } = await supabase
        .from("competitors")
        .delete()
        .eq("id", id)
        .eq("business_id", businessId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/competitors");
}
