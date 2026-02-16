import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Check if user record exists in our public.users table
            const admin = createAdminClient();

            const { data: existingUser } = await admin
                .from("users")
                .select("id")
                .eq("id", data.user.id)
                .single();

            if (!existingUser) {
                // New user — provision their account
                const fullName =
                    data.user.user_metadata?.full_name ||
                    data.user.email?.split("@")[0] ||
                    "User";
                const email = data.user.email!;
                const slug = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;

                // 1. Create user record
                const { error: userError } = await admin.from("users").insert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                });

                if (userError) {
                    console.error("Failed to create user record:", userError);
                    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                }

                // 2. Create default organization
                const { data: org, error: orgError } = await admin
                    .from("organizations")
                    .insert({
                        name: `${fullName}'s Restaurant`,
                        slug: slug,
                        type: "business",
                    })
                    .select() // Select all fields to access name and slug
                    .single();

                if (orgError) {
                    console.error("Failed to create organization:", orgError);
                    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                }

                // 3. Create default business (Critical for Onboarding Check)
                const { error: businessError } = await admin
                    .from("businesses")
                    .insert({
                        organization_id: org.id,
                        name: org.name,
                        slug: org.slug,
                        country: "US", // Default
                        timezone: "UTC", // Default
                        category: "retail", // Default
                        status: "active",
                    });

                if (businessError) {
                    console.error("Failed to create business:", businessError);
                    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                }

                // 4. Add user as organization owner
                const { error: memberError } = await admin
                    .from("organization_members")
                    .insert({
                        organization_id: org.id,
                        user_id: data.user.id,
                        role: "owner",
                        status: "active",
                    });

                if (memberError) {
                    console.error("Failed to create org membership:", memberError);
                    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                }

                // 4. Log the event
                await admin.from("events").insert({
                    organization_id: org.id,
                    user_id: data.user.id,
                    event_type: "user.signed_up",
                    entity_type: "user",
                    entity_id: data.user.id,
                    metadata: { email, full_name: fullName },
                });

                // 5. Send Welcome Email (Async / Fire & Forget)
                const { sendEmail } = await import("@/lib/resend/send-email");
                const { welcomeEmail } = await import("@/lib/resend/templates/welcome-email");

                const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                const loginUrl = rootDomain.includes("localhost")
                    ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
                    : `http://auth.${rootDomain}/login`;

                // We don't await this to prevent blocking the auth flow
                sendEmail({
                    to: email,
                    subject: "Welcome to Zyene Reviews!",
                    html: welcomeEmail({ userName: fullName || "User", loginUrl }),
                }).catch(err => console.error("Failed to send welcome email:", err));

                // Redirect new users to onboarding
                return NextResponse.redirect(`${origin}/onboarding`);
            }

            // Existing user (or newly created step skipped? No, wait)
            // Logic for linking GBP if not already linked
            // We need to check if the current login is creating a GBP link.
            // Since we are redirecting to dashboard, we should ensure the link exists.

            // Check if user is signing in via Google
            // Note: .provider might be 'google' inside identities or app_metadata
            const isGoogle = data.user.app_metadata.provider === 'google' ||
                data.user.identities?.some(id => id.provider === 'google');

            if (isGoogle) {
                console.log("DEBUG: Google Provider Detected");
                console.log("DEBUG: Provider Token Present?", !!data.session?.provider_token);
                console.log("DEBUG: Refresh Token Present?", !!data.session?.provider_refresh_token);

                // Find user's business
                const { data: memberData } = await admin
                    .from("organization_members")
                    .select(`
                        organizations (
                            businesses (id)
                        )
                    `)
                    .eq("user_id", data.user.id)
                    .single();

                // @ts-ignore - Supabase types might be deep
                const businessId = memberData?.organizations?.businesses?.[0]?.id;
                console.log("DEBUG: Found Business ID:", businessId);

                if (businessId) {
                    // Check if platform exists
                    const { data: platformData } = await admin
                        .from("review_platforms")
                        .select("id")
                        .eq("business_id", businessId)
                        .eq("platform", "google")
                        .single();

                    console.log("DEBUG: Platform Data Found?", !!platformData);

                    if (platformData) {
                        console.log("DEBUG: Updating Platform Tokens...");
                        // Update existing platform credentials
                        const { error: updateError } = await admin
                            .from("review_platforms")
                            .update({
                                access_token: data.session?.provider_token,
                                refresh_token: data.session?.provider_refresh_token,
                                sync_status: "active",
                                updated_at: new Date().toISOString(),
                            })
                            .eq("id", platformData.id);

                        if (updateError) console.error("DEBUG: Update Error:", updateError);
                        else console.log("DEBUG: Update Success");
                    } else {
                        console.log("DEBUG: Inserting New Platform...");
                        // Insert 'google' platform
                        await admin.from("review_platforms").insert({
                            business_id: businessId,
                            platform: "google",
                            sync_status: "active", // Assume active on connect
                            // Store tokens if we can access them from session
                            access_token: data.session?.provider_token,
                            refresh_token: data.session?.provider_refresh_token,
                        });
                    }
                } else {
                    console.log("DEBUG: No Business Found for User", data.user.id);
                }
            } else {
                console.log("DEBUG: Not identified as Google Provider");
                console.log("Provider:", data.user.app_metadata.provider);
                console.log("Identities:", data.user.identities);
            }

            // Existing user — redirect to dashboard
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            if (rootDomain.includes("localhost")) {
                return NextResponse.redirect(`http://${rootDomain}/dashboard`);
            } else {
                return NextResponse.redirect(`http://dashboard.${rootDomain}`);
            }
        }
    }

    // Auth code exchange failed — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
