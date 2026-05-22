import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { nanoid } from "nanoid";
import { listAccounts, listLocations, FULL_LOCATION_READ_MASK } from "@/services/google/business-profile";
import {
    reattachOrphanedGoogleReviews,
    refreshGoogleReviewRollupsFromDb,
} from "@/services/google/sync-service";
import { redis } from "@/lib/db/redis";
import { checkLimit } from "@/lib/stripe/check-limits";
import type {
    AuthMemberOrgContext,
    GoogleLocationDetails,
    GooglePlatformUpdatePayload,
} from "@/types/api-routes";
import { isPlausibleMobileNumber } from "@/lib/validations/phone";
import { acceptBusinessInvitationAdmin } from "@/lib/auth/accept-business-invitation";
import { inngest } from "@/services/inngest/client";
import { BUSINESS_LIMIT_UPGRADE_BILLING_HREF } from "@/lib/billing/business-limit-upgrade-href";

function signUpPhoneFromUserMetadata(user: { user_metadata?: Record<string, unknown> }): string | null {
    const raw = user.user_metadata?.phone;
    if (typeof raw !== "string") return null;
    const t = raw.trim();
    if (!t || !isPlausibleMobileNumber(t)) return null;
    return t;
}

/** Explicit opt-in for SMS review alerts (Twilio / toll-free compliance). Default false. */
function smsReviewAlertsConsentFromUserMetadata(user: { user_metadata?: Record<string, unknown> }): boolean {
    const v = user.user_metadata?.sms_review_alerts_consent;
    if (v === true) return true;
    if (typeof v === "string") return v.toLowerCase() === "true";
    return false;
}

function safeNextPath(raw: string | null): string {
    const fallback = "/dashboard";
    if (!raw) return fallback;

    const candidate = raw.startsWith("/") ? raw : `/${raw}`;
    if (candidate.startsWith("//")) return fallback;
    if (candidate.includes("\\") || candidate.includes("://")) return fallback;
    return candidate;
}

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zyenereviews.com";
        const code = searchParams.get("code");
        const next = safeNextPath(searchParams.get("next"));
        const biz = searchParams.get("biz");

        // "Add a Business" flow: org_id and user_id passed as URL query params.
        // These travel through the entire OAuth redirect chain (dashboard → Google → Supabase → here).
        const addBusinessOrgId = searchParams.get("add_org");
        const addBusinessUserId = searchParams.get("add_user");
        const isAddBusinessFlow = !!(addBusinessOrgId && next === "/businesses");

        if (!code) {
            return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
        }

        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user) {
            const errMessage = (error as { message?: string } | null)?.message;
            // Avoid leaking provider authorization code fragments into logs.
            const safeMessage =
                typeof errMessage === "string"
                    ? errMessage.replace(/external code[^:]*:\s*[^\\s]+/i, "external code: <redacted>")
                    : "No user returned from exchangeCodeForSession";

            Sentry.captureException(new Error(safeMessage), {
                tags: { route: "auth-callback", step: "exchangeCodeForSession" },
            });
            return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
        }

        if (data.user) {
            const admin = createAdminClient();

            let inviteParamForAccept =
                searchParams.get("invite")?.trim() ||
                (typeof data.user.user_metadata?.invite_token === "string"
                    ? data.user.user_metadata.invite_token.trim()
                    : "");

            // Fallback for verification flows where query params can be dropped by email providers/redirects.
            // If the user email has a pending invite, auto-resolve it so invitees skip onboarding.
            if (!inviteParamForAccept && data.user.email) {
                try {
                    const { data: pendingInvites } = await admin
                        .from("invitations")
                        .select("id, token, expires_at, created_at")
                        .ilike("email", data.user.email)
                        .is("accepted_at", null)
                        .order("created_at", { ascending: false })
                        .limit(10);

                    const now = Date.now();
                    const valid = (pendingInvites || []).find((inv) => {
                        if (!inv) return false;
                        if (!inv.expires_at) return true;
                        const ts = new Date(inv.expires_at).getTime();
                        return Number.isFinite(ts) && ts > now;
                    });

                    inviteParamForAccept =
                        (valid?.token && valid.token.trim()) ||
                        (valid?.id && valid.id.trim()) ||
                        "";
                } catch (e) {
                    console.error("[Auth Callback] Failed to resolve invite fallback by email:", e);
                }
            }

            if (isAddBusinessFlow && addBusinessOrgId) {
                // Check business limit before proceeding
                const limitCheck = await checkLimit(addBusinessOrgId, "businesses");
                if (!limitCheck.allowed) {
                    console.log(`⚠️ Business limit reached for org ${addBusinessOrgId}. Redirecting to billing.`);
                    return NextResponse.redirect(
                        `${String(appUrl).replace(/\/+$/, "")}${BUSINESS_LIMIT_UPGRADE_BILLING_HREF}`,
                    );
                }

                // ─── ADD BUSINESS FLOW ──────────────────────────

                // Ensure the OAuth user has a public.users record (in case it's a new auth user)
                const { data: existingUser } = await admin
                    .from("users")
                    .select("id")
                    .eq("id", data.user.id)
                    .single();

                if (!existingUser) {
                    const addBizPhone = signUpPhoneFromUserMetadata(data.user);
                    await admin.from("users").insert({
                        id: data.user.id,
                        email: data.user.email!,
                        full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
                        phone: addBizPhone,
                    });
                }

                // Extract Google tokens from the OAuth session
                const finalAccessToken = data.session?.provider_token;
                const finalRefreshToken = data.session?.provider_refresh_token;

                // Fetch Google Business Profile hierarchy
                let googleAccountId: string | null = null;
                let googleLocationId: string | null = null;
                let externalId: string | null = null;
                let googleReviewUrl: string | null = null;
                let locationName: string | null = null;

                // Location details for the business record
                let bizPhone: string | null = null;
                let bizAddress: string | null = null;
                let bizCity: string | null = null;
                let bizState: string | null = null;
                let bizZip: string | null = null;
                let bizWebsite: string | null = null;
                let bizCategory = "uncategorized";

                // Map Google category to internal key
                const CATEGORY_MAP: Record<string, string> = {
                    restaurant: "restaurant", dining: "restaurant", food: "restaurant", eatery: "restaurant",
                    pizza: "restaurant", sushi: "restaurant", burger: "restaurant", grill: "restaurant",
                    bistro: "restaurant", steakhouse: "restaurant", bakery: "restaurant",
                    cafe: "coffee", coffee: "coffee", "coffee shop": "coffee", tea: "coffee",
                    salon: "salon", beauty: "salon", barber: "salon", "hair salon": "salon",
                    "nail salon": "salon", cosmetics: "salon",
                    dentist: "dental", dental: "dental", orthodontist: "dental",
                    gym: "gym", fitness: "gym", "yoga studio": "gym", "pilates studio": "gym",
                    "personal trainer": "gym", crossfit: "gym",
                    spa: "spa", massage: "spa", wellness: "spa",
                    hotel: "hotel", motel: "hotel", resort: "hotel", inn: "hotel", "bed and breakfast": "hotel",
                    retail: "retail", store: "retail", shop: "retail", boutique: "retail", market: "retail",
                    auto: "automotive", automotive: "automotive", "car dealer": "automotive",
                    "car repair": "automotive", mechanic: "automotive", "auto repair": "automotive",
                    doctor: "healthcare", hospital: "healthcare", clinic: "healthcare",
                    medical: "healthcare", healthcare: "healthcare", pharmacy: "healthcare",
                    veterinarian: "healthcare", chiropractor: "healthcare",
                };

                try {
                    if (finalAccessToken) {
                        const accounts = await listAccounts(finalAccessToken);
                        if (accounts.length > 0) {
                            const account = accounts[0];
                            googleAccountId = account.name.split("/")[1];

                            const locations = await listLocations(finalAccessToken, account.name, FULL_LOCATION_READ_MASK);
                            if (locations.length > 0) {
                                const location = locations[0] as GoogleLocationDetails;
                                googleLocationId = location.name.split("/").pop() || null;
                                externalId = googleLocationId;
                                locationName = location.title || null;

                                googleReviewUrl = location.metadata?.newReviewUri || location.metadata?.mapsUri || null;
                                if (location.metadata?.placeId) {
                                    googleReviewUrl = `https://search.google.com/local/writereview?placeid=${location.metadata.placeId}`;
                                }

                                // Extract full details from the same API response (no extra call)
                                bizPhone = location.phoneNumbers?.primaryPhone || null;
                                bizAddress = location.storefrontAddress?.addressLines?.join(", ") || null;
                                bizCity = location.storefrontAddress?.locality || null;
                                bizState = location.storefrontAddress?.administrativeArea || null;
                                bizZip = location.storefrontAddress?.postalCode || null;
                                bizWebsite = location.websiteUri || null;

                                const googleCat = (location.categories?.primaryCategory?.displayName || "").toLowerCase();
                                for (const [keyword, value] of Object.entries(CATEGORY_MAP)) {
                                    if (googleCat.includes(keyword)) {
                                        bizCategory = value;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                } catch (hierarchyError) {
                    console.error("Failed to fetch GBP hierarchy:", hierarchyError);
                    Sentry.captureException(hierarchyError, { tags: { route: "auth-callback", step: "fetch_gbp_hierarchy_add_biz" } });
                }

                // Create the NEW business in the ORIGINAL org (from URL param)
                const newBizName = locationName || `${data.user.user_metadata?.full_name || "New"}'s Business`;
                const newBizSlug = `${newBizName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;

                // Use the Google OAuth email as support email
                const supportEmail = data.user.email || null;

                const { data: newBusiness, error: newBizError } = await admin
                    .from("businesses")
                    .insert({
                        organization_id: addBusinessOrgId,
                        name: newBizName,
                        slug: newBizSlug,
                        country: "US",
                        timezone: "UTC",
                        category: bizCategory,
                        status: "active",
                        google_review_url: googleReviewUrl,
                        email: supportEmail,
                        phone: bizPhone,
                        address_line1: bizAddress,
                        city: bizCity,
                        state: bizState,
                        zip: bizZip,
                        website: bizWebsite,
                    })
                    .select("id")
                    .single();

                if (newBizError) {
                    console.error("Failed to create new business:", newBizError);
                    Sentry.captureException(newBizError, { tags: { route: "auth-callback", step: "create_new_business" } });
                } else if (newBusiness) {
                    const { data: encAccess } = await admin.rpc("encrypt_token", { plaintext: finalAccessToken || "" });
                    const { data: encRefresh } = await admin.rpc("encrypt_token", { plaintext: finalRefreshToken || "" });

                    // Link Google platform to the new business
                    await admin.from("review_platforms").insert({
                        business_id: newBusiness.id,
                        platform: "google",
                        sync_status: "active",
                        access_token: encAccess,
                        refresh_token: encRefresh,
                        google_account_id: googleAccountId,
                        google_location_id: googleLocationId,
                        external_id: externalId,
                        external_url: googleReviewUrl,
                        total_reviews: 0,
                        average_rating: 0,
                    });

                    console.log(`✅ New business "${newBizName}" (${newBusiness.id}) added to org ${addBusinessOrgId}`);

                    await admin.from("business_members").upsert(
                        {
                            business_id: newBusiness.id,
                            user_id: data.user.id,
                            role: "owner",
                            status: "active",
                        },
                        { onConflict: "business_id,user_id" }
                    );

                    try {
                        await inngest.send({
                            name: "google-seo-aeo/sync.run",
                            data: { businessId: newBusiness.id, trigger: "onboarding" },
                        });
                    } catch (e) {
                        console.error("[Auth Callback] Failed to queue Google SEO/AEO sync:", e);
                    }
                }

                // If the OAuth switched to a DIFFERENT auth user (different Google account),
                // sign out the OAuth user and restore the ORIGINAL user's session server-side.
                if (addBusinessUserId && addBusinessUserId !== data.user.id) {
                    console.log(`Session switched from ${addBusinessUserId} to ${data.user.id}. Auto-restoring original user.`);
                    await supabase.auth.signOut();

                    const { data: originalUser } = await admin.auth.admin.getUserById(addBusinessUserId);
                    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

                    if (originalUser?.user?.email) {
                        // Generate a magic link token and verify it SERVER-SIDE.
                        // This sets the session cookies for the original user without any redirect.
                        const { data: linkData } = await admin.auth.admin.generateLink({
                            type: 'magiclink',
                            email: originalUser.user.email,
                        });

                        if (linkData?.properties?.hashed_token) {
                            const { error: verifyError } = await supabase.auth.verifyOtp({
                                token_hash: linkData.properties.hashed_token,
                                type: 'magiclink',
                            });

                            if (!verifyError) {
                                console.log(`✅ Session restored for ${originalUser.user.email}`);
                                // Session is now set — redirect to businesses page
                                return NextResponse.redirect(`${appUrl}/businesses`);
                            } else {
                                console.error("Failed to verify magic link:", verifyError);
                                Sentry.captureException(verifyError, { tags: { route: "auth-callback", step: "verify_magic_link" } });
                            }
                        }
                    }

                    // Fallback: redirect to login if auto-restore failed
                    return NextResponse.redirect(`${appUrl}/login?message=business_added`);
                }

                // Same Google account — redirect straight to businesses page
                return NextResponse.redirect(`${appUrl}/businesses`);
            }

            // ─── NORMAL AUTH FLOW (not "Add Business") ──────────
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
                const signupPhone = signUpPhoneFromUserMetadata(data.user);
                const smsReviewAlertsConsent = smsReviewAlertsConsentFromUserMetadata(data.user);

                const { error: userError } = await admin.from("users").insert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                    phone: signupPhone,
                });

                if (userError) {
                    console.error("Failed to create user record:", userError);
                    Sentry.captureException(userError, { tags: { route: "auth-callback", step: "create_user" } });
                    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                }

                const invited = await acceptBusinessInvitationAdmin({
                    admin,
                    userId: data.user.id,
                    userEmail: data.user.email,
                    inviteParam: inviteParamForAccept || null,
                });
                if (invited.accepted) {
                    return NextResponse.redirect(`${appUrl}/`);
                }

                const { data: org, error: orgError } = await admin
                    .from("organizations")
                    .insert({
                        name: `${fullName}'s Org`,
                        slug: slug,
                        type: "business",
                    })
                    .select()
                    .single();

                if (orgError) {
                    console.error("Failed to create organization:", orgError);
                    Sentry.captureException(orgError, { tags: { route: "auth-callback", step: "create_organization" } });
                    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                }

                const { data: newBusiness, error: newBizError } = await admin
                    .from("businesses")
                    .insert({
                        organization_id: org.id,
                        name: `${fullName}'s Business`,
                        slug: org.slug,
                        country: "US",
                        timezone: "UTC",
                        category: "uncategorized",
                        status: "active",
                    })
                    .select("id")
                    .single();

                if (newBizError || !newBusiness) {
                    console.error("Failed to create default business:", newBizError);
                    Sentry.captureException(newBizError ?? new Error("missing business id"), {
                        tags: { route: "auth-callback", step: "create_business" },
                    });
                    return NextResponse.redirect(`${origin}/login?error=setup_failed`);
                }

                await admin.from("business_members").upsert(
                    {
                        business_id: newBusiness.id,
                        user_id: data.user.id,
                        role: "owner",
                        status: "active",
                    },
                    { onConflict: "business_id,user_id" }
                );

                if (signupPhone) {
                    const { error: prefErr } = await admin.from("notification_preferences").upsert(
                        {
                            user_id: data.user.id,
                            business_id: newBusiness.id,
                            email_enabled: true,
                            digest_enabled: true,
                            sms_enabled: smsReviewAlertsConsent,
                            sms_phone_number: smsReviewAlertsConsent ? signupPhone : null,
                            email_frequency: "immediately",
                            min_urgency_for_sms: 7,
                            min_rating_threshold: 1,
                            quiet_hours_start: "22:00:00",
                            quiet_hours_end: "08:00:00",
                        },
                        { onConflict: "user_id,business_id" }
                    );
                    if (prefErr) {
                        console.error("Failed to seed notification preferences:", prefErr);
                        Sentry.captureException(prefErr, {
                            tags: { route: "auth-callback", step: "seed_notification_preferences" },
                        });
                    }
                }

                await admin.from("organization_members").insert({
                    organization_id: org.id,
                    user_id: data.user.id,
                    role: "ORG_OWNER",
                    status: "active",
                });

                await admin.from("events").insert({
                    organization_id: org.id,
                    user_id: data.user.id,
                    event_type: "user.signed_up",
                    entity_type: "user",
                    entity_id: data.user.id,
                    metadata: { email, full_name: fullName },
                });

                const { sendEmail } = await import("@/services/resend/send-email");
                const { welcomeEmail, welcomeEmailText } = await import("@/services/resend/templates/welcome-email");
                const loginUrl = `${appUrl}/login`;

                sendEmail({
                    to: email,
                    subject: "Your Zyene Reviews account is ready",
                    html: welcomeEmail({ userName: fullName || "User", loginUrl }),
                    text: welcomeEmailText({ userName: fullName || "User", loginUrl }),
                }).catch(err => {
                    console.error("Failed to send welcome email:", err);
                    Sentry.captureException(err, { tags: { route: "auth-callback", step: "send_welcome_email" } });
                });

                try {
                    const { scheduleTrialNurture } = await import("@/lib/growth/schedule-growth-emails");
                    await scheduleTrialNurture({
                        email,
                        userName: fullName || "there",
                        userId: data.user.id,
                        organizationId: org.id,
                    });
                } catch (nurtureErr) {
                    console.error("Failed to schedule trial nurture:", nurtureErr);
                    Sentry.captureException(nurtureErr, { tags: { route: "auth-callback", step: "schedule_trial_nurture" } });
                }

                // New users go to onboarding on app subdomain
                return NextResponse.redirect(`${appUrl}/onboarding`);
            }

            // ─── EXISTING USER LOGIN ────────────────────────────
            const invited = await acceptBusinessInvitationAdmin({
                admin,
                userId: data.user.id,
                userEmail: data.user.email,
                inviteParam: inviteParamForAccept || null,
            });
            if (invited.accepted) {
                return NextResponse.redirect(`${appUrl}/dashboard`);
            }

            const isGoogle = data.user.app_metadata.provider === 'google' ||
                data.user.identities?.some(id => id.provider === 'google');

            if (isGoogle) {
                const finalAccessToken = data.session?.provider_token;
                const finalRefreshToken = data.session?.provider_refresh_token;

                // Prefer explicit business id from the OAuth redirect (biz=...).
                // Fallback to the first business in the user’s org membership.
                let businessId: string | null = null;
                if (biz) {
                    const { data: bizRow, error: bizErr } = await admin
                        .from("businesses")
                        .select(`id, organizations!inner(organization_members!inner(user_id))`)
                        .eq("id", biz)
                        .eq("organizations.organization_members.user_id", data.user.id)
                        .single();
                    if (!bizErr && bizRow?.id) {
                        businessId = bizRow.id;
                    }
                }

                if (!businessId) {
                    const { data: memberData } = await admin
                        .from("organization_members")
                        .select(`organizations ( businesses (id) )`)
                        .eq("user_id", data.user.id)
                        .maybeSingle();

                    businessId =
                        (memberData as unknown as AuthMemberOrgContext)?.organizations?.businesses?.[0]?.id ?? null;
                }

                if (businessId) {
                    const { data: platformData } = await admin
                        .from("review_platforms")
                        .select("id")
                        .eq("business_id", businessId)
                        .eq("platform", "google")
                        .single();

                    const { data: encAccess } = await admin.rpc("encrypt_token", { plaintext: finalAccessToken || "" });
                    const { data: encRefresh } = await admin.rpc("encrypt_token", { plaintext: finalRefreshToken || "" });

                    if (platformData) {
                        const updatePayload: GooglePlatformUpdatePayload = {
                            access_token: encAccess,
                            sync_status: "active",
                            updated_at: new Date().toISOString(),
                        };
                        // Only update tokens here. Location is selected later.
                        if (finalRefreshToken) updatePayload.refresh_token = encRefresh;

                        await admin.from("review_platforms").update(updatePayload).eq("id", platformData.id);
                    } else {
                        const { data: newPlatform, error: insPlatErr } = await admin
                            .from("review_platforms")
                            .insert({
                                business_id: businessId,
                                platform: "google",
                                sync_status: "active",
                                total_reviews: 0,
                                average_rating: 0,
                                access_token: encAccess,
                                refresh_token: encRefresh,
                                google_account_id: null,
                                google_location_id: null,
                                external_id: null,
                                external_url: null,
                            })
                            .select("id")
                            .single();

                        if (insPlatErr) {
                            console.error("[Auth Callback] review_platforms insert failed:", insPlatErr);
                        } else if (newPlatform?.id) {
                            await reattachOrphanedGoogleReviews(admin, businessId, newPlatform.id);
                            await refreshGoogleReviewRollupsFromDb(admin, businessId, newPlatform.id);
                            try {
                                await inngest.send({
                                    name: "google-seo-aeo/sync.run",
                                    data: { businessId, trigger: "onboarding" },
                                });
                            } catch (e) {
                                console.error("[Auth Callback] Failed to queue Google SEO/AEO sync:", e);
                            }
                        }
                    }

                    // Notifications are registered after the user selects the correct GBP location/account.

                    // Clear cached business context so the integrations UI immediately reflects "Connected".
                    try {
                        await redis.del(`user_businesses:${data.user.id}`);
                    } catch (e) {
                        console.error("[Auth Callback] Failed to clear business cache:", e);
                    }
                }
            }

            // Preserve the caller intent (e.g. integrations page -> /integrations).
            return NextResponse.redirect(`${appUrl}${next}`);
        }
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    } catch (error) {
        Sentry.captureException(error, {
            tags: { route: "auth-callback", step: "unhandled" },
        });
        const { origin } = new URL(request.url);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
}
