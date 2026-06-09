"use server";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { revalidatePath } from "next/cache";
import { registerNotificationsWithRetry } from "@/services/google/notifications";
import { parseGoogleLocationResourceIds } from "@/services/google/business-profile";
import {
  enqueueGooglePostConnectSync,
  type GoogleBusinessLocation,
  type GoogleStorefrontAddress,
} from "./types";
import type { OnboardingGoogleLocationInfo } from "@/types/components";

type GoogleLocationInput = GoogleBusinessLocation | OnboardingGoogleLocationInfo;

function resolveStorefrontAddress(loc: GoogleLocationInput): GoogleStorefrontAddress | null {
  if ("storefrontAddress" in loc && loc.storefrontAddress) {
    const raw = loc.storefrontAddress;
    if (typeof raw === "string") return { addressLines: [raw] };
    return raw;
  }
  if (loc.address || loc.city || loc.state) {
    return {
      addressLines: loc.address ? [loc.address] : undefined,
      locality: loc.city,
      administrativeArea: loc.state,
    };
  }
  return null;
}

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
      logger.error(
        { body: await tokenResponse.text() },
        "Failed to exchange auth code",
      );
      return {
        success: false,
        error: "Failed to authenticate with Google.",
      };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshTokenFromGoogle = tokenData.refresh_token as string | undefined;

    if (!accessToken) {
      return {
        success: false,
        error: "Failed to obtain access token.",
      };
    }

    if (!refreshTokenFromGoogle) {
      logger.warn(
        { businessId, redirectUri },
        "[Onboarding] Google token exchange returned no refresh_token (sync will fail until reconnect)",
      );
    }

    // Fetch Google Business Profile data and optionally update business with first location.
    // Account list: mybusinessaccountmanagement API (NOT businessinformation)
    // Location details: mybusinessbusinessinformation API
    // Review counts: mybusiness API (separate endpoint)
    const reviewData = { reviewCount: 0, averageRating: 0 };
    let locationInfo: { businessName?: string; address?: string; city?: string; state?: string; phone?: string; category?: string } | undefined;

    try {
      // Step 1: List all accounts
      const accountsResponse = await fetch(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        const accounts = accountsData.accounts || [];

        if (accounts.length > 0) {
          // Step 2: List locations across all accounts
          const locationGroups = await Promise.all(
            accounts.map(async (account: { name: string }) => {
              const locationsResponse = await fetch(
                `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=${encodeURIComponent("title,storefrontAddress,phoneNumbers,categories,websiteUri,profile,metadata")}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );

              if (!locationsResponse.ok) {
                return [] as GoogleBusinessLocation[];
              }

              const locationsData = await locationsResponse.json();
              return (locationsData.locations || []) as GoogleBusinessLocation[];
            })
          );
          const allLocations = locationGroups.flat();

          // If multiple locations found, return them for user selection
          if (allLocations.length > 1) {
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

            const mappedLocations = allLocations.map(loc => {
                const addr = loc.storefrontAddress;
                const googleCategoryName = (loc.categories?.primaryCategory?.displayName || "").toLowerCase();
                let mappedCategory = "other";
                for (const [keyword, value] of Object.entries(CATEGORY_MAP)) {
                    if (googleCategoryName.includes(keyword)) {
                        mappedCategory = value;
                        break;
                    }
                }

                return {
                    name: loc.name,
                    businessName: loc.title,
                    address: addr?.addressLines?.[0] || "",
                    city: addr?.locality || "",
                    state: addr?.administrativeArea || "",
                    phone: loc.phoneNumbers?.primaryPhone || "",
                    category: mappedCategory,
                    fullAddress: `${addr?.addressLines?.[0] || ""}, ${addr?.locality || ""}, ${addr?.administrativeArea || ""}`.replace(/^, /, "").replace(/, , /g, ", "),
                };
            });

            return {
              success: true,
              multipleLocations: true,
              locations: mappedLocations,
              tokens: {
                accessToken,
                refreshToken: refreshTokenFromGoogle,
                expiresIn: tokenData.expires_in
              }
            };
          }

          // If only 1 location (or 0, but usually 1), proceed with auto-setup
          if (allLocations.length === 1) {
            return await finalizeGoogleConnection(
              businessId, 
              allLocations[0], 
              { 
                accessToken, 
                refreshToken: refreshTokenFromGoogle, 
                expiresIn: tokenData.expires_in 
              }
            );
          }
        }
      }
      
      return {
        success: false,
        error: "No Google Business locations found for this account."
      };

    } catch (apiError) {
      logger.error({ err: apiError }, "Error fetching Google Business Profile data");
      return {
        success: false,
        error: "Failed to fetch your Google Business details. You can continue manually."
      };
    }
  } catch (error: unknown) {
    logger.error({ err: error }, "Unexpected error in initializeGoogleAuth");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Finalizes the Google Business Profile connection after selection (or auto-selection).
 */
export async function finalizeGoogleConnection(
  businessId: string,
  location: GoogleLocationInput,
  tokens: { accessToken: string; refreshToken?: string; expiresIn: number }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) {
      return { success: false, error: "You do not have access to this business." };
    }

    const { accessToken, refreshToken, expiresIn } = tokens;

    // Review counts and basic info
    let reviewData = { reviewCount: 0, averageRating: 0 };
    const loc = location;
    const addr = resolveStorefrontAddress(loc);
    const phone =
      ("phoneNumbers" in loc && loc.phoneNumbers?.primaryPhone) || loc.phone;

    // Mapping Category (Reuse logic)
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
    const categoryDisplay =
      "categories" in loc && loc.categories?.primaryCategory?.displayName
        ? loc.categories.primaryCategory.displayName
        : loc.category ?? "";
    const googleCategoryName = categoryDisplay.toLowerCase();
    let mappedCategory = "other";
    for (const [keyword, value] of Object.entries(CATEGORY_MAP)) {
        if (googleCategoryName.includes(keyword)) {
            mappedCategory = value;
            break;
        }
    }

    // Fetch review summary
    try {
      const locationName = loc.name; 
      if (locationName) {
        const reviewsResponse = await fetch(
          `https://mybusiness.googleapis.com/v4/${locationName}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          reviewData = {
            reviewCount: reviewsData.metrics?.totalSummary?.reviewCount || 0,
            averageRating: reviewsData.metrics?.totalSummary?.averageRating || 0,
          };
        }
      }
    } catch (reviewErr) {
      logger.error({ err: reviewErr }, "[Google API] Could not fetch review count");
    }

    // Extract Review URL and Place ID
    const metadata = "metadata" in loc ? loc.metadata : undefined;
    let googleReviewUrl = metadata?.newReviewUri || metadata?.mapsUri || null;
    if (metadata?.placeId) {
        googleReviewUrl = `https://search.google.com/local/writereview?placeid=${metadata.placeId}`;
    }

    // Update business record
    const displayName =
      ("title" in loc && loc.title) || loc.businessName || "";
    const slug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
      
    await supabase
      .from("businesses")
      .update({
        name: displayName || undefined,
        address_line1: addr?.addressLines?.[0] ?? null,
        city: addr?.locality || loc.city || null,
        state: addr?.administrativeArea || loc.state || null,
        zip: addr?.postalCode || null,
        phone: phone || null,
        website: ("websiteUri" in loc && loc.websiteUri) || null,
        email: user.email || null,
        category: mappedCategory || "other",
        google_review_url: googleReviewUrl,
        updated_at: new Date().toISOString(),
        ...(slug ? { slug } : {}),
      })
      .eq("id", businessId);

    // Store platform tokens + GBP resource IDs (required for sync without listAccounts)
    const { googleAccountId, googleLocationId } = parseGoogleLocationResourceIds(
      typeof loc.name === "string" ? loc.name : null
    );
    const admin = createAdminClient();

    const { data: existingPlatform } = await admin
      .from("review_platforms")
      .select("refresh_token")
      .eq("business_id", businessId)
      .eq("platform", "google")
      .maybeSingle();

    const { data: encAccess, error: encAccessError } = await admin.rpc("encrypt_token", {
      plaintext: accessToken || "",
    });
    if (encAccessError || !encAccess) {
      logger.error({ err: encAccessError }, "[Onboarding] encrypt_token failed for access token");
      return {
        success: false,
        error: "Could not secure Google credentials. Please try connecting again.",
      };
    }

    let encRefresh: string | null = null;
    if (refreshToken) {
      const { data: encrypted, error: encRefreshError } = await admin.rpc("encrypt_token", {
        plaintext: refreshToken,
      });
      if (encRefreshError || !encrypted) {
        logger.error({ err: encRefreshError }, "[Onboarding] encrypt_token failed for refresh token");
        return {
          success: false,
          error: "Could not secure Google credentials. Please try connecting again.",
        };
      }
      encRefresh = encrypted;
    }

    const refreshTokenToStore = encRefresh ?? existingPlatform?.refresh_token ?? null;
    if (!refreshTokenToStore) {
      return {
        success: false,
        error:
          "Google did not provide a refresh token. Disconnect Google in Integrations (if shown), then connect again from this step.",
      };
    }

    const expiresInSeconds =
      typeof expiresIn === "number" && Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3600;

    const { error: platformUpsertError } = await admin.from("review_platforms").upsert(
      {
        business_id: businessId,
        platform: "google",
        access_token: encAccess,
        refresh_token: refreshTokenToStore,
        token_expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
        google_account_id: googleAccountId,
        google_location_id: googleLocationId,
        external_id: googleLocationId,
        external_url: googleReviewUrl,
        total_reviews: reviewData.reviewCount,
        average_rating: reviewData.averageRating,
        sync_status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id,platform" }
    );

    if (platformUpsertError) {
      logger.error({ err: platformUpsertError }, "[Onboarding] review_platforms upsert failed");
      return { success: false, error: "Failed to save Google connection. Please try again." };
    }

    // Trigger syncs (immediately)
    const { data: platformData } = await admin
      .from("review_platforms")
      .select("id")
      .eq("business_id", businessId)
      .eq("platform", "google")
      .single();

    let googleSyncWarning: string | undefined;

    if (platformData?.id) {
      const syncOutcome = await enqueueGooglePostConnectSync(platformData.id);
      if (syncOutcome.mode === "failed") {
        logger.error(
          { err: syncOutcome.error },
          "[Onboarding] Google review sync could not be started after connect",
        );
        googleSyncWarning =
          "Google is connected, but starting the review import failed. Use Sync on Integrations or Reviews in a few minutes.";
      }

      // Register notifications (non-fatal; logs WARNING after retry if still failing)
      const topicName = process.env.GOOGLE_PUBSUB_TOPIC_NAME;
      if (topicName) {
          const accountName = loc.name?.split("/locations")[0];
          if (accountName) {
            const googleAccountId = accountName.replace(/^accounts\//, "") || accountName;
            await registerNotificationsWithRetry({
              accessToken,
              accountName,
              topic: topicName,
              platformId: platformData.id,
              googleAccountId,
              logPrefix: "[Onboarding]",
            });
          }
      }
    }

    revalidatePath("/onboarding");

    return {
      success: true,
      reviewData,
      googleSyncWarning,
      locationInfo: {
        businessName: displayName || loc.businessName,
        address: addr?.addressLines?.join(", ") ?? undefined,
        city: addr?.locality || loc.city,
        state: addr?.administrativeArea || loc.state,
        phone,
        category: mappedCategory,
      },
    };
  } catch (err) {
    logger.error({ err }, "finalizeGoogleConnection error");
    return { success: false, error: "Failed to finalize connection" };
  }
}
