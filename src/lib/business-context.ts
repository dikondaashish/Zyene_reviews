import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getBusinessContext(userId: string) {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const activeBusinessId = cookieStore.get("active_business_id")?.value;

    const { data: memberData } = await supabase
        .from("organization_members")
        .select(
            `
            organizations (
                *,
                businesses (
                    *,
                    review_platforms (*)
                )
            )
        `
        )
        .eq("user_id", userId)
        .single();

    // @ts-ignore
    const organization = memberData?.organizations || {};
    // @ts-ignore
    const businesses = organization.businesses || [];

    const selectedBusiness = businesses.find((b: any) => b.id === activeBusinessId) || businesses[0];
    
    // Default structure if no business exists
    const business = selectedBusiness || {
        id: null,
        total_reviews: 0,
        average_rating: 0,
        slug: "",
        name: "",
        review_platforms: [],
    };

    return {
        organization,
        activeBusiness: business,
        allBusinesses: businesses,
    };
}
