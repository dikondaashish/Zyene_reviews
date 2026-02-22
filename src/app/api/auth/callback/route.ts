import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { nanoid } from "nanoid";
import { listAccounts, listLocations } from "@/lib/google/business-profile";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    // Detect "Add a Business" flow vs normal login
    const isAddBusinessFlow = next === "/businesses";

    if (code) {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            const admin = createAdminClient();

            const { data: existingUser } = await admin
                .from("users")
                .select("id")
                .eq("id", data.user.id)
                .single();

            if (!existingUser) {
                // ─── NEW USER SIGNUP ───────────────────────────────
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
                const { error: businessError } = await admin
                    .from("businesses")
                    .insert({
                        organization_id: org.id,
                        name: org.name,
                        slug: org.slug,
                        country: "US",
                        timezone: "UTC",
                        category: "retail",
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

                // 5. Log the event
                await admin.from("events").insert({
                    organization_id: org.id,
                    user_id: data.user.id,
                    event_type: "user.signed_up",
                    entity_type: "user",
                    entity_id: data.user.id,
                    metadata: { email, full_name: fullName },
                });

                // 6. Send Welcome Email (Async / Fire & Forget)
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

                // Redirect new users to dashboard
                return NextResponse.redirect(`${origin}/dashboard`);
            }

            // ─── EXISTING USER ──────────────────────────────────
            const isGoogle = data.user.app_metadata.provider === 'google' ||
                data.user.identities?.some(id => id.provider === 'google');

            if (isGoogle) {
                // Extract Google tokens
                const sessionToken = data.session?.provider_token;
                const sessionRefreshToken = data.session?.provider_refresh_token;
                const googleIdentity = data.user.identities?.find(id => id.provider === 'google');
                // @ts-ignore
                const identityToken = googleIdentity?.identity_data?.provider_token;
                // @ts-ignore
                const identityRefreshToken = googleIdentity?.identity_data?.provider_refresh_token;
                const finalAccessToken = sessionToken || identityToken;
                const finalRefreshToken = sessionRefreshToken || identityRefreshToken;

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
                                locationName = location.title || (location as any).storefrontAddress?.locality || null;

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

                // Find user's organization
                const { data: memberData } = await admin
                    .from("organization_members")
                    .select(`
                        organization_id,
                        organizations (
                            id,
                            businesses (id, name)
                        )
                    `)
                    .eq("user_id", data.user.id)
                    .single();

                // @ts-ignore
                const orgId = memberData?.organization_id;
                // @ts-ignore
                const existingBusinesses: any[] = memberData?.organizations?.businesses || [];

                if (isAddBusinessFlow && orgId) {
                    // ─── ADD BUSINESS FLOW ───────────────────────
                    // Create a NEW business in the existing org
                    const newBizName = locationName || "New Business";
                    const newBizSlug = `${newBizName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;

                    const { data: newBusiness, error: newBizError } = await admin
                        .from("businesses")
                        .insert({
                            organization_id: orgId,
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
                        return NextResponse.redirect(`${origin}/businesses?error=add_failed`);
                    }

                    // Link Google platform to the NEW business
                    if (newBusiness) {
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

                        console.log(`✅ New business "${newBizName}" (${newBusiness.id}) added to org ${orgId}`);
                    }

                    // Redirect back to businesses page
                    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                    if (rootDomain.includes("localhost")) {
                        return NextResponse.redirect(`http://${rootDomain}/businesses`);
                    } else {
                        return NextResponse.redirect(`http://dashboard.${rootDomain}/businesses`);
                    }
                } else {
                    // ─── NORMAL LOGIN FLOW ───────────────────────
                    // Update existing first business's Google tokens
                    const businessId = existingBusinesses[0]?.id;

                    if (businessId) {
                        const { data: platformData } = await admin
                            .from("review_platforms")
                            .select("id")
                            .eq("business_id", businessId)
                            .eq("platform", "google")
                            .single();

                        if (platformData) {
                            // Update existing platform tokens
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

                            await admin
                                .from("review_platforms")
                                .update(updatePayload)
                                .eq("id", platformData.id);
                        } else {
                            // Insert new platform for existing business
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

                        // Update business URL if empty
                        if (googleReviewUrl) {
                            await admin.from("businesses")
                                .update({ google_review_url: googleReviewUrl })
                                .eq("id", businessId)
                                .is("google_review_url", null);
                        }
                    }
                }
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
