import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAccounts, listLocations } from "@/lib/google/business-profile";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const next = "/dashboard"; // Redirect to dashboard after adding business

    if (error) {
        return NextResponse.redirect(`${origin}/dashboard?error=google_auth_error`);
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/dashboard?error=no_code`);
    }

    const supabase = await createClient();

    // Exchange code for session (we need the provider token)
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.session) {
        console.error("Auth Error:", sessionError);
        return NextResponse.redirect(`${origin}/dashboard?error=auth_failed`);
    }

    const user = sessionData.user;
    const providerToken = sessionData.session.provider_token;
    const providerRefreshToken = sessionData.session.provider_refresh_token;

    if (!providerToken) {
        console.error("No provider token found");
        return NextResponse.redirect(`${origin}/dashboard?error=no_provider_token`);
    }

    try {
        const admin = createAdminClient();

        // 1. Get current user's organization (assume first active org owner/admin)
        const { data: memberData } = await admin
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id)
            .in("role", ["owner", "admin"]) // Only owners/admins can add businesses
            .eq("status", "active")
            .limit(1)
            .single();

        if (!memberData?.organization_id) {
            return NextResponse.redirect(`${origin}/dashboard?error=no_permission`);
        }

        const orgId = memberData.organization_id;

        // 2. Fetch Google Locations
        const accounts = await listAccounts(providerToken);
        if (!accounts || accounts.length === 0) {
            return NextResponse.redirect(`${origin}/dashboard?error=no_google_accounts`);
        }

        const account = accounts[0]; // Default to first account
        const googleAccountId = account.name.split("/")[1];
        const locations = await listLocations(providerToken, account.name);

        if (!locations || locations.length === 0) {
             return NextResponse.redirect(`${origin}/dashboard?error=no_locations`);
        }

        // 3. Find a location to add (simple logic: pick first one not already in DB?)
        // For now, let's just pick the first one and create a new business for it.
        // In a real app, we'd show a UI to pick which location.
        // Here we assume "Add Business" -> "User picks Google Account" -> "We pick first location".
        
        const location = locations[0];
        const locationName = location.locationName || location.title || "New Business";
        const slug = `${locationName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;
        
        const googleLocationId = location.name.split("/").pop();
        const externalId = googleLocationId;
        const googleReviewUrl = location.metadata?.newReviewUri || location.metadata?.mapsUri 
            || (location.metadata?.placeId ? `https://search.google.com/local/writereview?placeid=${location.metadata.placeId}` : null);


        // 4. Create Business
        const { data: newBusiness, error: busError } = await admin
            .from("businesses")
            .insert({
                organization_id: orgId,
                name: locationName,
                slug: slug,
                country: "US", // Default or extract from location.address to default
                timezone: "UTC", // Default
                category: location.categories?.primaryCategory?.displayName || "retail",
                status: "active",
                google_review_url: googleReviewUrl
            })
            .select()
            .single();

        if (busError) {
             console.error("Create Business Error:", busError);
             return NextResponse.redirect(`${origin}/dashboard?error=create_business_failed`);
        }

        // 5. Link Platform
        const { error: platformError } = await admin.from("review_platforms").insert({
            business_id: newBusiness.id,
            platform: "google",
            sync_status: "active",
            access_token: providerToken,
            refresh_token: providerRefreshToken || null, // Might be null if re-auth without prompt
            google_account_id: googleAccountId,
            google_location_id: googleLocationId,
            external_id: externalId,
            external_url: googleReviewUrl
        });

        if (platformError) {
            console.error("Link Platform Error:", platformError);
            // Business created but platform failed?
        }

        // 6. Redirect to dashboard
        return NextResponse.redirect(`${origin}/dashboard?success=business_added`);

    } catch (err) {
        console.error("Connect Business Error:", err);
        return NextResponse.redirect(`${origin}/dashboard?error=unknown_error`);
    }
}
