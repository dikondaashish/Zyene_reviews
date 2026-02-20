import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { nanoid } from "nanoid";
import { listAccounts, listLocations } from "@/lib/google/business-profile";

export async function GET(request: Request) {
    console.log("DEBUG: Auth Callback HIT - URL:", request.url);
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const admin = createAdminClient();
        
        await admin.from("debug_logs").insert({ message: "Auth Callback Started", data: { code: code.substring(0, 5) + "..." } });

        console.log("DEBUG: Exchanging code for session...");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
             console.error("DEBUG: Session Exchange Error:", error);
             await admin.from("debug_logs").insert({ message: "Session Exchange Error", data: error });
        }

        if (!error && data.user) {
            console.log("DEBUG: Session Exchanged. User ID:", data.user.id);
            console.log("DEBUG: User Metadata:", JSON.stringify(data.user.user_metadata));
            await admin.from("debug_logs").insert({ 
                message: "Session Token Exchanged", 
                data: { user_id: data.user.id, metadata: data.user.user_metadata } 
            });
            
            // Check if user record exists in our public.users table

            const { data: existingUser } = await admin
                .from("users")
                .select("id")
                .eq("id", data.user.id)
                .single();
            
            console.log("DEBUG: Existing user check:", existingUser ? "Found" : "Not Found");
            let inviteProcessed = false;

            if (!existingUser) {
                // New user — provision their account
                const fullName =
                    data.user.user_metadata?.full_name ||
                    data.user.email?.split("@")[0] ||
                    "User";
                console.log("DEBUG: Provisioning new user:", fullName);
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

                // CHECK FOR INVITE
                const inviteToken = data.user.user_metadata?.invite;
                let targetOrgId: string | null = null;

                if (inviteToken) {
                    console.log("DEBUG: Processing Invite Token:", inviteToken);
                    await admin.from("debug_logs").insert({ message: "Processing Invite Token", data: { inviteToken } });
                    
                    // Fetch invitation
                    const { data: invite, error: inviteFetchError } = await admin
                        .from("invitations")
                        .select("*")
                        .eq("token", inviteToken)
                        .single();

                    if (invite && !inviteFetchError) {
                         await admin.from("debug_logs").insert({ message: "Invite Found", data: invite });
                        // Check expiry
                        if (new Date(invite.expires_at) > new Date()) {
                            // Valid Invite - Add to Org
                             const { error: memberError } = await admin
                                .from("organization_members")
                                .insert({
                                    organization_id: invite.organization_id,
                                    user_id: data.user.id,
                                    role: invite.role.startsWith("STORE") ? "ORG_EMPLOYEE" : invite.role, 
                                    status: "active",
                                });

                            if (!memberError) {
                                // If Store Role, add to business_members
                                if (invite.business_id && invite.role.startsWith("STORE")) {
                                     await admin
                                        .from("business_members")
                                        .insert({
                                            business_id: invite.business_id,
                                            user_id: data.user.id,
                                            role: invite.role,
                                            status: "active"
                                        });
                                }

                                // Delete invitation
                                await admin.from("invitations").delete().eq("id", invite.id);
                                
                                inviteProcessed = true;
                                targetOrgId = invite.organization_id;
                                console.log("DEBUG: Invite processed successfully. User added to org:", invite.organization_id);
                                await admin.from("debug_logs").insert({ message: "Invite Processed Success", data: { orgId: invite.organization_id } });
                            } else {
                                console.error("Failed to add invited user to org:", memberError);
                                await admin.from("debug_logs").insert({ message: "Member Insert Failed", data: memberError });
                            }
                        } else {
                            console.error("DEBUG: Invite expired");
                            await admin.from("debug_logs").insert({ message: "Invite Expired", data: { expires_at: invite.expires_at } });
                        }
                    } else {
                        console.error("DEBUG: Invite not found or error:", inviteFetchError);
                        await admin.from("debug_logs").insert({ message: "Invite Not Found or Error", data: inviteFetchError });
                    }
                } else {
                    await admin.from("debug_logs").insert({ message: "No Invite Token in Metadata", data: {} });
                }

                if (!inviteProcessed) {
                    await admin.from("debug_logs").insert({ message: "Fallback to New Org Creation", data: {} });
                    // Default Flow: Create new Organization
                    const { data: org, error: orgError } = await admin
                        .from("organizations")
                        .insert({
                            name: `${fullName}'s Restaurant`,
                            slug: slug,
                            type: "business",
                            created_at: new Date().toISOString(), // Explicitly set created_at for sorting log? No, DB handles it.
                        })
                        .select() // Select all fields to access name and slug
                        .single();

                    if (orgError) {
                        console.error("Failed to create organization:", orgError);
                        return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                    }
                    
                    targetOrgId = org.id;

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
                            role: "ORG_OWNER",
                            status: "active",
                        });

                    if (memberError) {
                        console.error("Failed to create org membership:", memberError);
                        return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                    }
                }

                // 4. Log the event

                // 4. Log the event
                // 4. Log the event
                if (targetOrgId) {
                    await admin.from("events").insert({
                        organization_id: targetOrgId,
                        user_id: data.user.id,
                        event_type: "user.signed_up",
                        entity_type: "user",
                        entity_id: data.user.id,
                        metadata: { email, full_name: fullName, invited: inviteProcessed },
                    });
                }

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
                // return NextResponse.redirect(`${origin}/onboarding`);
                
                // FALLTHROUGH: Don't return yet! We want to link the GBP account below.
                // We'll redirect to /onboarding at the end.
            }

            // Existing user (or newly created step skipped? No, wait)
            // Logic for linking GBP if not already linked
            // We need to check if the current login is creating a GBP link.
            // Since we are redirecting to dashboard, we should ensure the link exists.

            console.log("DEBUG: Investigating Google Provider Connection");
            console.log("DEBUG: App Metadata Provider:", data.user.app_metadata.provider);
            console.log("DEBUG: Identities Providers:", data.user.identities?.map(id => id.provider));
            
            const isGoogle = data.user.app_metadata.provider === 'google' ||
                data.user.identities?.some(id => id.provider === 'google');
            
            console.log("DEBUG: isGoogle detected:", isGoogle);

            if (isGoogle) {
                console.log("DEBUG: Google Provider Flow Started");
                console.log("DEBUG: Session Keys:", Object.keys(data.session || {}));
                console.log("DEBUG: Provider Token Present?", !!data.session?.provider_token);
                console.log("DEBUG: Refresh Token Present?", !!data.session?.provider_refresh_token);
                if (data.session?.provider_refresh_token) {
                    console.log("DEBUG: Provider Refresh Token Length:", data.session.provider_refresh_token.length);
                } else {
                    console.log("DEBUG: Provider Refresh Token is MISSING/UNDEFINED");
                }

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

                    // Robust Token Extraction
                    const sessionToken = data.session?.provider_token;
                    const sessionRefreshToken = data.session?.provider_refresh_token;

                    // Fallback: Check identities if session is missing tokens
                    const googleIdentity = data.user.identities?.find(id => id.provider === 'google');
                    // @ts-ignore
                    const identityToken = googleIdentity?.identity_data?.provider_token;
                    // @ts-ignore
                    const identityRefreshToken = googleIdentity?.identity_data?.provider_refresh_token;

                    console.log("DEBUG: Token Sources - Session Token:", !!sessionToken, "Session RT:", !!sessionRefreshToken);
                    console.log("DEBUG: Token Sources - Identity Token:", !!identityToken, "Identity RT:", !!identityRefreshToken);

                    const finalAccessToken = sessionToken || identityToken;
                    const finalRefreshToken = sessionRefreshToken || identityRefreshToken;

                    console.log("DEBUG: Token Extraction Result:");
                    console.log("- Session RT:", !!sessionRefreshToken);
                    console.log("- Identity RT:", !!identityRefreshToken);
                    console.log("- Final RT:", !!finalRefreshToken);

                    // Fetch Google Hierarchy IDs
                    let googleAccountId: string | null = null;
                    let googleLocationId: string | null = null;
                    let externalId: string | null = null;
                    let googleReviewUrl: string | null = null;

                    try {
                        if (finalAccessToken) {
                            console.log("DEBUG: Fetching Google Hierarchy...");
                            const accounts = await listAccounts(finalAccessToken);
                            if (accounts.length > 0) {
                                const account = accounts[0]; // Default to first account
                                googleAccountId = account.name.split("/")[1];

                                const locations = await listLocations(finalAccessToken, account.name);
                                if (locations.length > 0) {
                                    const location = locations[0]; // Default to first location
                                    googleLocationId = location.name.split("/").pop() || null;
                                    externalId = googleLocationId; // This is what we used before as external_id

                                    // Extract URL
                                    googleReviewUrl = location.metadata?.newReviewUri || location.metadata?.mapsUri || null;
                                    if (location.metadata?.placeId) {
                                        googleReviewUrl = `https://search.google.com/local/writereview?placeid=${location.metadata.placeId}`;
                                    }
                                }
                            }
                        }
                    } catch (hierarchyError) {
                        console.error("DEBUG: Failed to fetch hierarchy in callback:", hierarchyError);
                        // Ensure we don't block auth, backfill will handle it later
                    }

                    if (platformData) {
                        console.log("DEBUG: Updating Platform Tokens & IDs...");
                        const updatePayload: any = {
                            access_token: finalAccessToken,
                            sync_status: "active",
                            updated_at: new Date().toISOString(),
                        };

                        if (googleAccountId) updatePayload.google_account_id = googleAccountId;
                        if (googleLocationId) updatePayload.google_location_id = googleLocationId;
                        if (externalId) updatePayload.external_id = externalId; // Ensure external_id is set
                        if (googleReviewUrl) updatePayload.external_url = googleReviewUrl;

                        if (finalRefreshToken) {
                            updatePayload.refresh_token = finalRefreshToken;
                        }

                        const { error: updateError } = await admin
                            .from("review_platforms")
                            .update(updatePayload)
                            .eq("id", platformData.id);

                        if (updateError) console.error("DEBUG: Update Error:", updateError);
                        else console.log("DEBUG: Update Success");
                    } else {
                        console.log("DEBUG: Inserting New Platform...");
                        const { data: insertData, error: insertError } = await admin.from("review_platforms").insert({
                            business_id: businessId,
                            platform: "google",
                            sync_status: "active",
                            access_token: finalAccessToken || "",
                            refresh_token: finalRefreshToken || "",
                            google_account_id: googleAccountId,
                            google_location_id: googleLocationId,
                            external_id: externalId,
                            external_url: googleReviewUrl
                        }).select().single();

                        if (insertError) {
                            console.error("DEBUG: Insert Error:", JSON.stringify(insertError));
                        } else {
                            console.log("DEBUG: Insert Success - Platform ID:", insertData?.id);
                        }
                    }

                    // If we got the URL, try to update business table too
                    if (googleReviewUrl) {
                        await admin.from("businesses")
                            .update({ google_review_url: googleReviewUrl })
                            .eq("id", businessId)
                            .is("google_review_url", null); // Only if empty
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
            // Redirect Logic
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            // If user existed OR was just invited/processed, go to dashboard. Only true new org creators go to onboarding.
            const destination = (existingUser || inviteProcessed) ? "/dashboard" : "/onboarding";

            if (rootDomain.includes("localhost")) {
                return NextResponse.redirect(`http://${rootDomain}${destination}`);
            } else {
                return NextResponse.redirect(`http://dashboard.${rootDomain}${destination === "/dashboard" ? "" : destination}`);
            }
        }
    }

    // Auth code exchange failed — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
