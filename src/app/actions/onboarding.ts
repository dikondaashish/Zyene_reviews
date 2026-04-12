"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/db/redis";
import {
  step1FormSchema,
  step3FormSchema,
  step4FormSchema,
  stepOrganizationSchema,
  stepBusinessLocationSchema,
  stepCategorySchema,
  stepNotificationsSchema,
  stepPlanSchema,
  type Step1FormData,
  type Step3FormData,
  type Step4FormData,
  type StepOrganizationFormData,
  type StepBusinessLocationFormData,
  type StepCategoryFormData,
  type StepNotificationsFormData,
  type StepPlanFormData,
} from "@/lib/validations/onboarding";
import { stripe } from "@/services/stripe/client";
import { PLAN_MAP, UNSUBSCRIBED_LIMITS } from "@/services/stripe/plans";
import { registerNotifications } from "@/services/google/notifications";
import { syncGoogleReviewsForPlatform } from "@/services/google/sync-service";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/services/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";

export async function createBusinessAndAdvanceOnboarding(
  data: Step1FormData,
  organizationId: string
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated. Please log in and try again.",
      };
    }

    // Validate input
    const validationResult = await step1FormSchema.safeParseAsync(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Generate slug from business name
    const slug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        organization_id: organizationId,
        name: data.businessName,
        category: data.businessCategory,
        city: data.city,
        phone: data.phone || null,
        slug: slug,
      })
      .select()
      .single();

    if (businessError || !business) {
      console.error("Error creating business:", businessError);
      return {
        success: false,
        error: "Failed to create business. Please try again.",
      };
    }

    // Update onboarding step
    const { error: updateError } = await supabase
      .from("users")
      .update({ onboarding_step: 2 } as any)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating onboarding step:", updateError);
      return {
        success: false,
        error: "Failed to save progress. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
      business,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in createBusinessAndAdvanceOnboarding:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Token exchange must use the same redirect_uri as the authorize URL (browser uses
 * window.location.origin). NEXT_PUBLIC_APP_URL alone can drift from the live host
 * (e.g. apex vs app subdomain), which makes Google reject the exchange.
 * When the client sends redirectUri, we accept it only if its host matches this request.
 */
async function resolveGoogleOAuthRedirectUri(clientRedirectUri?: string): Promise<string> {
  const envBase = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const fallback = `${envBase}/onboarding`;

  const headerList = await headers();
  const rawHost = headerList.get("x-forwarded-host") || headerList.get("host");
  const requestHost = rawHost?.split(",")[0]?.trim() ?? "";

  const trimmed = clientRedirectUri?.trim();
  if (!trimmed) {
    return fallback;
  }

  try {
    const u = new URL(trimmed);
    const path = u.pathname.replace(/\/$/, "") || "/";
    if (path !== "/onboarding") {
      return fallback;
    }
    if (requestHost && u.host === requestHost) {
      return `${u.origin}/onboarding`;
    }
  } catch {
    /* use fallback */
  }

  return fallback;
}

export async function initializeGoogleAuth(
  authCode: string,
  businessId: string,
  clientRedirectUri?: string
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated.",
      };
    }

    const redirectUri = await resolveGoogleOAuthRedirectUri(clientRedirectUri);

    // Exchange auth code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: authCode,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Failed to exchange auth code:", await tokenResponse.text());
      return {
        success: false,
        error: "Failed to authenticate with Google.",
      };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return {
        success: false,
        error: "Failed to obtain access token.",
      };
    }

    // Fetch Google Business Profile data and optionally update business with first location.
    // Account list: mybusinessaccountmanagement API (NOT businessinformation)
    // Location details: mybusinessbusinessinformation API
    // Review counts: mybusiness API (separate endpoint)
    let reviewData = { reviewCount: 0, averageRating: 0 };
    let locationInfo: { businessName?: string; address?: string; city?: string; state?: string; phone?: string; category?: string } | undefined;

    try {
      // Step 1: List accounts using the CORRECT Account Management API
      const accountsResponse = await fetch(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("[Google API] Accounts response status:", accountsResponse.status);

        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          const accounts = accountsData.accounts || [];

          console.log("[Google API] Found accounts:", accounts.length);

          if (accounts.length > 0) {
          const accountId = accounts[0].name; // e.g. "accounts/123456"

          // Step 2: List locations using Business Information API with extended readMask
          const locationsResponse = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=${encodeURIComponent("title,storefrontAddress,phoneNumbers,categories,websiteUri,profile,metadata")}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          console.log("[Google API] Locations response status:", locationsResponse.status);

          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            const locations = locationsData.locations || [];

            console.log("[Google API] Found locations:", locations.length);

            if (locations.length > 0) {
              const loc = locations[0];
              const addr = loc.storefrontAddress;
              const phone = loc.phoneNumbers?.primaryPhone || undefined;

              // Map Google's primaryCategory.displayName to our internal category values
              const googleCategoryName = (loc.categories?.primaryCategory?.displayName || "").toLowerCase();
              const CATEGORY_MAP: Record<string, string> = {
                restaurant: "restaurant", dining: "restaurant", food: "restaurant", eatery: "restaurant",
                pizza: "restaurant", sushi: "restaurant", burger: "restaurant", grill: "restaurant",
                bistro: "restaurant", steakhouse: "restaurant", bakery: "restaurant",
                cafe: "coffee", coffee: "coffee", "coffee shop": "coffee", tea: "coffee", "tea house": "coffee",
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
              let mappedCategory: string | undefined;
              for (const [keyword, value] of Object.entries(CATEGORY_MAP)) {
                if (googleCategoryName.includes(keyword)) {
                  mappedCategory = value;
                  break;
                }
              }
              console.log(`[Google API] Google category: "${googleCategoryName}" → mapped: "${mappedCategory || "other"}"`);

              locationInfo = {
                businessName: loc.title || undefined,
                address: addr?.addressLines?.join(", ") || undefined,
                city: addr?.locality || undefined,
                state: addr?.administrativeArea || undefined,
                phone,
                category: mappedCategory || "other",
              };

              console.log("[Google API] Location info:", JSON.stringify(locationInfo));

              // Step 3: Fetch review summary from My Business API
              try {
                const locationName = loc.name; // e.g. "accounts/123/locations/456"
                if (locationName) {
                  const reviewsResponse = await fetch(
                    `https://mybusiness.googleapis.com/v4/${locationName}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                  );
                  if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    // metrics.totalSummary is often missing on v4 Location GET; DB totals after sync are authoritative.
                    reviewData = {
                      reviewCount: reviewsData.metrics?.totalSummary?.reviewCount || 0,
                      averageRating: reviewsData.metrics?.totalSummary?.averageRating || 0,
                    };
                  }
                }
              } catch (reviewErr) {
                console.error("[Google API] Could not fetch review count (non-fatal):", reviewErr);
              }

              // Extract the ideal Review write URL
              let googleReviewUrl = loc.metadata?.newReviewUri || loc.metadata?.mapsUri || null;
              if (loc.metadata?.placeId) {
                  googleReviewUrl = `https://search.google.com/local/writereview?placeid=${loc.metadata.placeId}`;
              }

              // Update business record with location data pulled from Google
              const slug = (loc.title || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
                
              await supabase
                .from("businesses")
                .update({
                  name: loc.title || undefined,
                  address_line1: addr?.addressLines?.[0] || null,
                  city: addr?.locality || null,
                  state: addr?.administrativeArea || null,
                  zip: addr?.postalCode || null,
                  phone: phone || null,
                  website: loc.websiteUri || null,
                  email: user.email || null,
                  category: mappedCategory || "other",
                  google_review_url: googleReviewUrl,
                  updated_at: new Date().toISOString(),
                  ...(slug ? { slug } : {}),
                })
                .eq("id", businessId);
            }
          } else {
            const locBody = await locationsResponse.text();
            console.error("[Google API] Locations error body:", locBody);
          }
        }
      } else {
        const acctBody = await accountsResponse.text();
        console.error("[Google API] Accounts error body:", acctBody);
      }
    } catch (apiError) {
      console.error("Error fetching Google Business Profile data:", apiError);
    }

    // Store the access token in review_platforms table.
    // Use onConflict so the unique constraint (business_id, platform) triggers an UPDATE
    // instead of a failing INSERT when the record already exists.
    // Encrypt tokens before storing
    const { data: encAccess } = await supabase.rpc("encrypt_token", { plaintext: accessToken || "" });
    const { data: encRefresh } = await supabase.rpc("encrypt_token", { plaintext: tokenData.refresh_token || "" });

    const { error: platformError } = await supabase
      .from("review_platforms")
      .upsert(
        {
          business_id: businessId,
          platform: "google",
          access_token: encAccess,
          refresh_token: encRefresh || null,
          token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          total_reviews: reviewData.reviewCount,
          average_rating: reviewData.averageRating,
          sync_status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "business_id,platform" }
      );

    if (platformError) {
      console.error("Error storing platform token:", platformError);
      return {
        success: false,
        error: "Failed to store connection. Please try again.",
      };
    }

    // Trigger review sync immediately
    const { data: platformData } = await supabase
      .from("review_platforms")
      .select("id")
      .eq("business_id", businessId)
      .eq("platform", "google")
      .single();

    if (platformData?.id) {
      console.log(`[Onboarding] Triggering sync for platform ${platformData.id}`);
      // Initial review sync - wait for this
      await syncGoogleReviewsForPlatform(platformData.id).catch((e) =>
        console.error("[Onboarding] Google review sync failed:", e)
      );

      // Other syncs in the background
      syncGooglePerformanceForPlatform(platformData.id).catch((e) =>
        console.error("[Onboarding] Performance sync failed:", e)
      );
      syncGooglePhase2ForPlatform(platformData.id).catch((e) =>
        console.error("[Onboarding] Q&A sync failed:", e)
      );
      syncGoogleListingProfileForPlatform(platformData.id).catch((e) =>
        console.error("[Onboarding] Profile health sync failed:", e)
      );
      syncGoogleLodgingForPlatform(platformData.id).catch((e) =>
        console.error("[Onboarding] Lodging sync failed:", e)
      );
    }

    // Google v4 Location GET often returns no metrics (shows 0). After sync, totals are authoritative in DB.
    const { data: platformAfterSync } = await supabase
      .from("review_platforms")
      .select("total_reviews, average_rating")
      .eq("business_id", businessId)
      .eq("platform", "google")
      .maybeSingle();

    if (platformAfterSync) {
      reviewData = {
        reviewCount: platformAfterSync.total_reviews ?? reviewData.reviewCount,
        averageRating:
          typeof platformAfterSync.average_rating === "number"
            ? platformAfterSync.average_rating
            : reviewData.averageRating,
      };
    }

    // NEW: Register for real-time notifications via Pub/Sub
    const topicName = process.env.GOOGLE_PUBSUB_TOPIC_NAME;
    if (topicName && locationInfo?.businessName) {
      try {
        // Find the account name from locations
        // InitializeGoogleAuth fetches locations[0]
        // The topic name should be pre-configured in env
        const accountsResponse = await fetch(
          "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          const accountName = accountsData.accounts?.[0]?.name;
          if (accountName) {
            console.log(`[Google API] Registering notifications for account ${accountName} to topic ${topicName}`);
            await registerNotifications(accessToken, accountName, topicName);
            console.log(`[Google API] Notification registration successful.`);
          }
        } else {
          console.warn(`[Google API] Could not retrieve accounts for notification registration (Status: ${accountsResponse.status})`);
        }
      } catch (regError) {
        console.error("[Google API] Failed to register GBP notifications:", regError);
        // Don't fail the whole connection, just log it.
      }
    }

    revalidatePath("/onboarding");

    return {
      success: true,
      reviewData,
      locationInfo,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in initializeGoogleAuth:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateOnboardingStep(
  businessId: string,
  step: number
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated.",
      };
    }

    // Update onboarding step
    const { error } = await supabase
      .from("users")
      .update({
        onboarding_step: step,
        onboarding_completed: step === 5,
      } as any)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating onboarding step:", error);
      return {
        success: false,
        error: "Failed to save progress. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in updateOnboardingStep:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function saveNotificationPreferences(
  businessId: string,
  data: Step3FormData
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated.",
      };
    }

    // Validate input
    const validationResult = await step3FormSchema.safeParseAsync(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Ensure SMS phone number is provided if SMS is enabled
    if (data.smsAlerts && !data.smsPhoneNumber) {
      return {
        success: false,
        error: "Please provide a phone number for SMS alerts.",
      };
    }

    // Upsert notification preferences
    const { error: preferencesError } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          business_id: businessId,
          email_enabled: data.emailAlerts,
          email_frequency: data.emailFrequency,
          sms_enabled: data.smsAlerts,
          sms_phone_number: data.smsPhoneNumber || null,
          min_rating_threshold: parseInt(data.minRatingThreshold),
        },
        { onConflict: "user_id,business_id" }
      );

    if (preferencesError) {
      console.error("Error saving notification preferences:", preferencesError);
      return {
        success: false,
        error: "Failed to save notification preferences. Please try again.",
      };
    }

    // Update onboarding step to 4
    const { error: updateError } = await supabase
      .from("users")
      .update({
        onboarding_step: 5,
        onboarding_completed: true,
      } as any)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating onboarding step:", updateError);
      return {
        success: false,
        error: "Failed to save progress. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in saveNotificationPreferences:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function sendFirstReviewRequest(
  businessId: string,
  data: Step4FormData
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated.",
      };
    }

    // Validate input
    const validationResult = await step4FormSchema.safeParseAsync(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Ensure phone is provided if SMS channel is selected
    if ((data.channel === "sms" || data.channel === "both") && !data.recipientPhone) {
      return {
        success: false,
        error: "Please provide a phone number for SMS delivery.",
      };
    }

    // Create review request
    const { data: reviewRequest, error: requestError } = await supabase
      .from("review_requests")
      .insert({
        business_id: businessId,
        recipient_name: data.recipientName,
        recipient_email: data.recipientEmail,
        recipient_phone: data.recipientPhone || null,
        channel: data.channel,
        status: "pending",
        created_at: new Date().toISOString(),
        is_onboarding: true, // Mark as onboarding request for analytics
      })
      .select()
      .single();

    if (requestError || !reviewRequest) {
      console.error("Error creating review request:", requestError);
      return {
        success: false,
        error: "Failed to send review request. Please try again.",
      };
    }

    // Mark onboarding as completed
    const { error: completionError } = await supabase
      .from("users")
      .update({
        onboarding_step: 4,
        onboarding_completed: true,
      } as any)
      .eq("id", user.id);

    if (completionError) {
      console.error("Error marking onboarding complete:", completionError);
      // Continue anyway - request was successful
    }

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");

    return {
      success: true,
      reviewRequestId: reviewRequest.id,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in sendFirstReviewRequest:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function completeOnboarding(businessId: string) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated.",
      };
    }

    // Mark onboarding as completed
    const { error } = await supabase
      .from("users")
      .update({
        onboarding_step: 5,
        onboarding_completed: true,
      } as any)
      .eq("id", user.id);

    if (error) {
      console.error("Error completing onboarding:", error);
      return {
        success: false,
        error: "Failed to complete onboarding. Please try again.",
      };
    }

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in completeOnboarding:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ====================
// NEW: 4-Step Onboarding Functions
// ====================

/**
 * Step 1: Create Organization
 * User enters organization name → Creates organization record
 */
export async function createOrganization(
  data: StepOrganizationFormData
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated. Please log in and try again.",
      };
    }

    // Validate input
    const validationResult = stepOrganizationSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Generate slug from organization name
    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: data.organizationName,
        slug: slug,
        type: "business",
        plan: "none",
        plan_status: "active",
      })
      .select()
      .single();

    if (orgError || !organization) {
      console.error("Error creating organization:", orgError);
      return {
        success: false,
        error: "Failed to create organization. Please try again.",
      };
    }

    // Invalidate business context cache
    const cacheKey = `user_businesses:${user.id}`;
    await redis.del(cacheKey).catch(e => console.error("Redis del error:", e));
    revalidatePath("/", "layout");

    // Add user as owner of organization
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: "ORG_OWNER",
      });

    if (memberError) {
      console.error("Error adding organization member:", memberError);
      return {
        success: false,
        error: "Failed to set up organization access. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };
  } catch (error: unknown) {
    console.error("Unexpected error in createOrganization:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Update organization name (Step 1 of onboarding)
 */
export async function updateOrganizationName(
  organizationId: string,
  name: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You are not authenticated." };
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let finalSlug = slug;
    let { error } = await supabase
      .from("organizations")
      .update({ name, slug: finalSlug, updated_at: new Date().toISOString() })
      .eq("id", organizationId);

    // Handle slug collision (23505 = unique_violation)
    if (error && error.code === "23505" && (error.message.includes("slug") || error.details?.includes("slug"))) {
      finalSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      console.log(`Slug collision detected for "${slug}". Retrying with "${finalSlug}"`);
      
      const { error: retryError } = await supabase
        .from("organizations")
        .update({ name, slug: finalSlug, updated_at: new Date().toISOString() })
        .eq("id", organizationId);
      
      error = retryError;
    }

    if (error) {
      console.error("Error updating organization:", error.message, error.details, error.hint);
      return { success: false, error: `Failed to update organization name: ${error.message}` };
    }
    const { error: stepError } = await supabase
      .from("users")
      .update({ onboarding_step: 2 } as any)
      .eq("id", user.id);
    if (stepError) console.error("Error updating onboarding step:", stepError);
    revalidatePath("/onboarding");
    return { success: true };
  } catch (error: unknown) {
    console.error("updateOrganizationName:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Update business name and first location (Step 2 of onboarding)
 */
export async function updateBusinessAndLocation(
  businessId: string,
  data: { businessName: string; address?: string; city?: string; state?: string; phone?: string }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You are not authenticated." };
    }
    const slug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const { error } = await supabase
      .from("businesses")
      .update({
        name: data.businessName,
        slug,
        address_line1: data.address || null,
        city: data.city || null,
        state: data.state || null,
        phone: data.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId);
    if (error) {
      console.error("Error updating business:", error);
      return { success: false, error: "Failed to update business." };
    }
    revalidatePath("/onboarding");
    return { success: true };
  } catch (error: unknown) {
    console.error("updateBusinessAndLocation:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Step 2: Create Business + Location Details
 * User enters business name + location details → Creates business record with location info
 */
export async function createBusinessWithLocation(
  organizationId: string,
  data: StepBusinessLocationFormData
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated. Please log in and try again.",
      };
    }

    // Validate input
    const validationResult = stepBusinessLocationSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Generate business slug
    const businessSlug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create business with location info
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        organization_id: organizationId,
        name: data.businessName,
        slug: businessSlug,
        address_line1: data.address,
        city: data.city,
        state: data.state.toUpperCase(),
        phone: data.phone || null,
        category: "uncategorized", // Will be set in Step 3
        country: "US", // Default to US
        timezone: "America/Los_Angeles", // Default timezone, can be updated later
      })
      .select()
      .single();

    if (businessError || !business) {
      console.error("Error creating business:", businessError);
      return {
        success: false,
        error: "Failed to create business. Please try again.",
      };
    }

    // Invalidate business context cache
    const cacheKey = `user_businesses:${user.id}`;
    await redis.del(cacheKey).catch(e => console.error("Redis del error:", e));
    revalidatePath("/", "layout");
    revalidatePath("/onboarding");

    return {
      success: true,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        address_line1: business.address_line1,
        city: business.city,
        state: business.state,
      },
    };
  } catch (error: unknown) {
    console.error("Unexpected error in createBusinessWithLocation:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Step 3: Update Business Category
 * User selects business category → Updates business record
 */
export async function updateBusinessCategory(
  businessId: string,
  data: StepCategoryFormData
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated. Please log in and try again.",
      };
    }

    // Validate input
    const validationResult = stepCategorySchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Update business category
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        category: data.category,
      })
      .eq("id", businessId);

    if (updateError) {
      console.error("Error updating business category:", updateError);
      return {
        success: false,
        error: "Failed to update category. Please try again.",
      };
    }

    // Update onboarding step to 4 (Plan Selection)
    const { error: stepError } = await supabase
      .from("users")
      .update({
        onboarding_step: 4,
      } as any)
      .eq("id", user.id);

    if (stepError) {
      console.error("Error updating onboarding step:", stepError);
    }

    // Invalidate business context cache
    const cacheKey = `user_businesses:${user.id}`;
    await redis.del(cacheKey).catch(e => console.error("Redis del error:", e));
    revalidatePath("/", "layout");
    revalidatePath("/businesses");
    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in updateBusinessCategory:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Step 4: Create Notification Preferences
 * User configures notifications → Creates notification_preferences record
 */
export async function createNotificationPreferences(
  businessId: string,
  data: StepNotificationsFormData
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated. Please log in and try again.",
      };
    }

    // Validate input
    const validationResult = stepNotificationsSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    const { data: profile } = await supabase.from("users").select("phone").eq("id", user.id).maybeSingle();
    const { data: existingPref } = await supabase
      .from("notification_preferences")
      .select("sms_phone_number")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .maybeSingle();

    const fromForm = data.phone?.trim() || "";
    const smsPhone =
      fromForm ||
      existingPref?.sms_phone_number?.trim() ||
      profile?.phone?.trim() ||
      null;

    const { error: preferencesError } = await supabase.from("notification_preferences").upsert(
      {
        user_id: user.id,
        business_id: businessId,
        email_enabled: data.emailAlerts,
        sms_enabled: data.smsAlerts,
        sms_phone_number: smsPhone,
        email_frequency: "immediately",
        digest_enabled: true,
        quiet_hours_start: "22:00:00",
        quiet_hours_end: "08:00:00",
        min_urgency_for_sms: 1,
        min_rating_threshold: 1,
      },
      { onConflict: "user_id,business_id" }
    );

    if (preferencesError) {
      console.error("Error saving notification preferences:", preferencesError);
      return {
        success: false,
        error: "Failed to save notification preferences. Please try again.",
      };
    }

    // Mark onboarding as completed for the user
    const { error: updateError } = await supabase
      .from("users")
      .update({
        onboarding_completed: true,
      } as any)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error marking onboarding complete:", updateError);
      // Continue anyway - preferences were saved
    }

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in createNotificationPreferences:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Trigger background sync for onboarding if Google is connected.
 * This is meant to be called when the user lands on the onboarding page
 * to ensure reviews are fetching while they complete the steps.
 */
export async function triggerOnboardingSync(businessId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // Find if Google is connected for this business
    const { data: platform } = await supabase
      .from("review_platforms")
      .select("*")
      .eq("business_id", businessId)
      .eq("platform", "google")
      .maybeSingle();

    if (!platform) return { success: false, error: "Google not connected" };

    // Trigger primary sync (await it to ensure it starts, or at least kicks off the process)
    // We don't wait for the full fetch, but we do wait for the initial result
    await syncGoogleReviewsForPlatform(platform.id);

    // Trigger other data in background
    syncGooglePerformanceForPlatform(platform.id).catch(console.error);
    syncGooglePhase2ForPlatform(platform.id).catch(console.error);
    syncGoogleListingProfileForPlatform(platform.id).catch(console.error);
    syncGoogleLodgingForPlatform(platform.id).catch(console.error);

    return { success: true };
  } catch (error) {
    console.error("Error triggering onboarding sync:", error);
    return { success: false, error: "Failed to trigger sync" };
  }
}

/**
 * Step 4: Save Plan Selection
 * Updates organization plan and advances user step.
 */
export async function savePlanSelection(
  organizationId: string,
  data: StepPlanFormData
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated.",
      };
    }

    // Validate input
    const validationResult = stepPlanSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Get limits for the selected plan
    const planConfig = PLAN_MAP[data.plan];
    const limits = planConfig?.limits || UNSUBSCRIBED_LIMITS;

    // Update organization plan and limits
    const { error: orgError } = await supabase
      .from("organizations")
      .update({
        plan: data.plan,
        plan_status: data.plan === "none" ? "active" : "trialing", // Trialing for paid plans
        max_businesses: limits.maxLocations,
        max_review_requests_per_month:
          limits.emailRequestsPerMonth +
          limits.smsRequestsPerMonth +
          limits.linkRequestsPerMonth,
        max_ai_replies_per_month: limits.smartRepliesPerMonth,
        max_email_requests_per_month: limits.emailRequestsPerMonth,
        max_sms_requests_per_month: limits.smsRequestsPerMonth,
        max_link_requests_per_month: limits.linkRequestsPerMonth,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (orgError) {
      console.error("Error saving plan selection:", orgError);
      return {
        success: false,
        error: "Failed to save plan. Please try again.",
      };
    }

    // Update onboarding step to 5 (Completion)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        onboarding_step: 5,
      } as any)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating onboarding step:", updateError);
      return {
        success: false,
        error: "Failed to save progress. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in savePlanSelection:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * After Stripe Checkout redirects back to onboarding, verify the session belongs to
 * the user's org (subscription is created; plan limits are synced via webhook).
 */
export async function finalizeOnboardingStripeCheckout(params: {
  sessionId?: string;
  planSwitchedOnly?: boolean;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You are not authenticated." };
    }

    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member?.organization_id) {
      return { success: false, error: "No organization found." };
    }

    const orgId = member.organization_id as string;

    if (params.planSwitchedOnly) {
      const { data: org } = await supabase
        .from("organizations")
        .select("stripe_subscription_id")
        .eq("id", orgId)
        .single();

      if (!org?.stripe_subscription_id) {
        return { success: false, error: "Subscription not found yet. Please refresh." };
      }
    } else if (params.sessionId) {
      const session = await stripe.checkout.sessions.retrieve(params.sessionId);

      if (session.status !== "complete") {
        return { success: false, error: "Checkout is not complete." };
      }

      if (session.metadata?.organization_id !== orgId) {
        return { success: false, error: "This checkout does not belong to your organization." };
      }

      const subscriptionId = session.subscription as string | null;
      if (!subscriptionId) {
        return { success: false, error: "No subscription on this checkout session." };
      }
    } else {
      return { success: false, error: "Invalid request." };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ onboarding_step: 5 } as any)
      .eq("id", user.id);

    if (updateError) {
      console.error("finalizeOnboardingStripeCheckout:", updateError);
      return { success: false, error: "Failed to update onboarding progress." };
    }

    revalidatePath("/onboarding");

    return { success: true };
  } catch (error: unknown) {
    console.error("finalizeOnboardingStripeCheckout:", error);
    return { success: false, error: "Could not verify checkout. Please try again." };
  }
}
