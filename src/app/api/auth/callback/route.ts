import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { nanoid } from "nanoid";
import { listAccounts, listLocations } from "@/lib/google/business-profile";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            const admin = createAdminClient();
            const cookieStore = await cookies();

            // ─── CHECK FOR "ADD BUSINESS" FLOW ────────────────
            // If these cookies exist, the user was adding a business to an existing org.
            // The OAuth may have created a new auth user (different Google account),
            // but we still want to add the business to the ORIGINAL org.
            const addBusinessOrgId = cookieStore.get("add_business_org_id")?.value;
            const addBusinessUserId = cookieStore.get("add_business_user_id")?.value;

            if (addBusinessOrgId && next === "/businesses") {
                // ─── ADD BUSINESS FLOW ──────────────────────────
                // Clear cookies immediately
                cookieStore.set("add_business_org_id", "", { path: "/", maxAge: 0 });
                cookieStore.set("add_business_user_id", "", { path: "/", maxAge: 0 });

                // Ensure the new auth user has a public.users record
                const { data: existingUser } = await admin
                    .from("users")
                    .select("id")
                    .eq("id", data.user.id)
                    .single();

                if (!existingUser) {
                    // Create user record for the new Google auth user
                    await admin.from("users").insert({
                        id: data.user.id,
                        email: data.user.email!,
                        full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
                    });
                }

                // Extract Google tokens
                const finalAccessToken = data.session?.provider_token;
                const finalRefreshToken = data.session?.provider_refresh_token;

                // Fetch Google Business Profile hierarchy
                let googleAccountId: string | null = null;
                let googleLocationId: string | null = null;
                let externalId: string | null = null;
                let googleReviewUrl: string | null = null;
                let locationName: string | null = null;

                try {
                    if (finalAccessToken) {
                        const accounts = await listAccounts(finalAccessToken);
                        if (accounts.length > 0) {
                            const account = accounts[0];
                            googleAccountId = account.name.split("/")[1];

                            const locations = await listLocations(finalAccessToken, account.name);
                            if (locations.length > 0) {
                                const location = locations[0];
                                googleLocationId = location.name.split("/").pop() || null;
                                externalId = googleLocationId;
                                locationName = location.title || null;

                                googleReviewUrl = location.metadata?.newReviewUri || location.metadata?.mapsUri || null;
                                if (location.metadata?.placeId) {
                                    googleReviewUrl = `https://search.google.com/local/writereview?placeid=${location.metadata.placeId}`;
                                }
                            }
                        }
                    }
                } catch (hierarchyError) {
                    console.error("Failed to fetch GBP hierarchy:", hierarchyError);
                }

                // Create the NEW business in the ORIGINAL org (from cookie)
                const newBizName = locationName || `${data.user.user_metadata?.full_name || "New"}'s Business`;
                const newBizSlug = `${newBizName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;

                const { data: newBusiness, error: newBizError } = await admin
                    .from("businesses")
                    .insert({
                        organization_id: addBusinessOrgId,
                        name: newBizName,
                        slug: newBizSlug,
                        country: "US",
                        timezone: "UTC",
                        category: "retail",
                        status: "active",
                        google_review_url: googleReviewUrl,
                    })
                    .select("id")
                    .single();

                if (newBizError) {
                    console.error("Failed to create new business:", newBizError);
                } else if (newBusiness) {
                    // Link Google platform to the new business
                    await admin.from("review_platforms").insert({
                        business_id: newBusiness.id,
                        platform: "google",
                        sync_status: "active",
                        access_token: finalAccessToken || "",
                        refresh_token: finalRefreshToken || "",
                        google_account_id: googleAccountId,
                        google_location_id: googleLocationId,
                        external_id: externalId,
                        external_url: googleReviewUrl,
                    });

                    console.log(`✅ New business "${newBizName}" (${newBusiness.id}) added to org ${addBusinessOrgId}`);
                }

                // CRITICAL: Sign back in as the ORIGINAL user
                // The OAuth may have switched the session to a different Google account.
                // We need to restore the original user's session.
                if (addBusinessUserId && addBusinessUserId !== data.user.id) {
                    console.log(`Session switched from ${addBusinessUserId} to ${data.user.id}. Signing out OAuth user.`);
                    // Sign out the new Google user — the original user will need to re-login
                    await supabase.auth.signOut();

                    // Redirect to login with a message
                    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                    if (rootDomain.includes("localhost")) {
                        return NextResponse.redirect(`http://${rootDomain}/login?message=business_added`);
                    } else {
                        return NextResponse.redirect(`http://auth.${rootDomain}/login?message=business_added`);
                    }
                }

                // Same user (same Google account) — redirect to businesses page
                const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                if (rootDomain.includes("localhost")) {
                    return NextResponse.redirect(`http://${rootDomain}/businesses`);
                } else {
                    return NextResponse.redirect(`http://dashboard.${rootDomain}/businesses`);
                }
            }

            // ─── NORMAL AUTH FLOW ───────────────────────────────
            const { data: existingUser } = await admin
                .from("users")
                .select("id")
                .eq("id", data.user.id)
                .single();

            if (!existingUser) {
                // ─── NEW USER SIGNUP ────────────────────────────
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
                        name: `${fullName}'s Business`,
                        slug: slug,
                        type: "business",
                    })
                    .select()
                    .single();

                if (orgError) {
                    console.error("Failed to create organization:", orgError);
                    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                }

                // 3. Create default business
                await admin.from("businesses").insert({
                    organization_id: org.id,
                    name: org.name,
                    slug: org.slug,
                    country: "US",
                    timezone: "UTC",
                    category: "retail",
                    status: "active",
                });

                // 4. Add user as organization owner
                await admin.from("organization_members").insert({
                    organization_id: org.id,
                    user_id: data.user.id,
                    role: "owner",
                    status: "active",
                });

                // 5. Log event
                await admin.from("events").insert({
                    organization_id: org.id,
                    user_id: data.user.id,
                    event_type: "user.signed_up",
                    entity_type: "user",
                    entity_id: data.user.id,
                    metadata: { email, full_name: fullName },
                });

                // 6. Send Welcome Email
                const { sendEmail } = await import("@/lib/resend/send-email");
                const { welcomeEmail } = await import("@/lib/resend/templates/welcome-email");
                const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                const loginUrl = rootDomain.includes("localhost")
                    ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
                    : `http://auth.${rootDomain}/login`;

                sendEmail({
                    to: email,
                    subject: "Welcome to Zyene Reviews!",
                    html: welcomeEmail({ userName: fullName || "User", loginUrl }),
                }).catch(err => console.error("Failed to send welcome email:", err));

                return NextResponse.redirect(`${origin}/dashboard`);
            }

            // ─── EXISTING USER LOGIN ────────────────────────────
            const isGoogle = data.user.app_metadata.provider === 'google' ||
                data.user.identities?.some(id => id.provider === 'google');

            if (isGoogle) {
                const finalAccessToken = data.session?.provider_token;
                const finalRefreshToken = data.session?.provider_refresh_token;

                // Fetch Google hierarchy
                let googleAccountId: string | null = null;
                let googleLocationId: string | null = null;
                let externalId: string | null = null;
                let googleReviewUrl: string | null = null;

                try {
                    if (finalAccessToken) {
                        const accounts = await listAccounts(finalAccessToken);
                        if (accounts.length > 0) {
                            const account = accounts[0];
                            googleAccountId = account.name.split("/")[1];
                            const locations = await listLocations(finalAccessToken, account.name);
                            if (locations.length > 0) {
                                const location = locations[0];
                                googleLocationId = location.name.split("/").pop() || null;
                                externalId = googleLocationId;
                                googleReviewUrl = location.metadata?.newReviewUri || location.metadata?.mapsUri || null;
                                if (location.metadata?.placeId) {
                                    googleReviewUrl = `https://search.google.com/local/writereview?placeid=${location.metadata.placeId}`;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch GBP hierarchy:", e);
                }

                // Find user's first business and update its tokens
                const { data: memberData } = await admin
                    .from("organization_members")
                    .select(`organizations ( businesses (id) )`)
                    .eq("user_id", data.user.id)
                    .single();

                // @ts-ignore
                const businessId = memberData?.organizations?.businesses?.[0]?.id;

                if (businessId) {
                    const { data: platformData } = await admin
                        .from("review_platforms")
                        .select("id")
                        .eq("business_id", businessId)
                        .eq("platform", "google")
                        .single();

                    if (platformData) {
                        const updatePayload: any = {
                            access_token: finalAccessToken,
                            sync_status: "active",
                            updated_at: new Date().toISOString(),
                        };
                        if (googleAccountId) updatePayload.google_account_id = googleAccountId;
                        if (googleLocationId) updatePayload.google_location_id = googleLocationId;
                        if (externalId) updatePayload.external_id = externalId;
                        if (googleReviewUrl) updatePayload.external_url = googleReviewUrl;
                        if (finalRefreshToken) updatePayload.refresh_token = finalRefreshToken;

                        await admin.from("review_platforms").update(updatePayload).eq("id", platformData.id);
                    } else {
                        await admin.from("review_platforms").insert({
                            business_id: businessId,
                            platform: "google",
                            sync_status: "active",
                            access_token: finalAccessToken || "",
                            refresh_token: finalRefreshToken || "",
                            google_account_id: googleAccountId,
                            google_location_id: googleLocationId,
                            external_id: externalId,
                            external_url: googleReviewUrl,
                        });
                    }

                    if (googleReviewUrl) {
                        await admin.from("businesses")
                            .update({ google_review_url: googleReviewUrl })
                            .eq("id", businessId)
                            .is("google_review_url", null);
                    }
                }
            }

            // Redirect to dashboard
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            if (rootDomain.includes("localhost")) {
                return NextResponse.redirect(`http://${rootDomain}/dashboard`);
            } else {
                return NextResponse.redirect(`http://dashboard.${rootDomain}`);
            }
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
