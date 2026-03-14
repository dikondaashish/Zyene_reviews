"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  step1FormSchema,
  step3FormSchema,
  step4FormSchema,
  stepOrganizationSchema,
  stepBusinessLocationSchema,
  stepCategorySchema,
  stepNotificationsSchema,
  type Step1FormData,
  type Step3FormData,
  type Step4FormData,
  type StepOrganizationFormData,
  type StepBusinessLocationFormData,
  type StepCategoryFormData,
  type StepNotificationsFormData,
} from "@/lib/validations/onboarding";

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
  } catch (error: any) {
    console.error("Unexpected error in createBusinessAndAdvanceOnboarding:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function initializeGoogleAuth(
  authCode: string,
  businessId: string
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
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/onboarding`,
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

    // Fetch Google Business Profile data and optionally update business with first location
    let reviewData = { reviewCount: 0, averageRating: 0 };
    let locationInfo: { businessName?: string; address?: string; city?: string; state?: string } | undefined;

    try {
      const accountsResponse = await fetch(
        "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        const accounts = accountsData.accounts || [];

        if (accounts.length > 0) {
          const accountId = accounts[0].name;
          const locationsResponse = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=title,storefrontAddress,reviewCount,averageRating`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            const locations = locationsData.locations || [];

            if (locations.length > 0) {
              const loc = locations[0];
              reviewData = {
                reviewCount: loc.reviewCount || 0,
                averageRating: loc.averageRating || 0,
              };
              const addr = loc.storefrontAddress;
              locationInfo = {
                businessName: loc.title || undefined,
                address: addr?.addressLines?.join(", "),
                city: addr?.locality,
                state: addr?.administrativeArea,
              };
              // Update business with first location data
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
                  updated_at: new Date().toISOString(),
                  ...(slug ? { slug } : {}),
                })
                .eq("id", businessId);
            }
          }
        }
      }
    } catch (apiError) {
      console.error("Error fetching Google Business Profile data:", apiError);
    }

    // Store the access token in review_platforms table
    const { error: platformError } = await supabase
      .from("review_platforms")
      .upsert({
        business_id: businessId,
        platform: "google",
        access_token: accessToken,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        sync_status: "active",
      })
      .eq("business_id", businessId)
      .eq("platform", "google");

    if (platformError) {
      console.error("Error storing platform token:", platformError);
      return {
        success: false,
        error: "Failed to store connection. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
      reviewData,
      locationInfo,
    };
  } catch (error: any) {
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
        onboarding_completed: step === 4,
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
  } catch (error: any) {
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
      .upsert({
        user_id: user.id,
        business_id: businessId,
        email_enabled: data.emailAlerts,
        email_frequency: data.emailFrequency,
        sms_enabled: data.smsAlerts,
        sms_phone_number: data.smsPhoneNumber || null,
        min_rating_threshold: parseInt(data.minRatingThreshold),
      })
      .eq("user_id", user.id)
      .eq("business_id", businessId);

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
        onboarding_step: 4,
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
  } catch (error: any) {
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
  } catch (error: any) {
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
        onboarding_step: 4,
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
  } catch (error: any) {
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

    // Add user as owner of organization
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: "owner",
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
  } catch (error: any) {
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
    const { error } = await supabase
      .from("organizations")
      .update({ name, slug, updated_at: new Date().toISOString() })
      .eq("id", organizationId);
    if (error) {
      console.error("Error updating organization:", error);
      return { success: false, error: "Failed to update organization name." };
    }
    const { error: stepError } = await supabase
      .from("users")
      .update({ onboarding_step: 2 } as any)
      .eq("id", user.id);
    if (stepError) console.error("Error updating onboarding step:", stepError);
    revalidatePath("/onboarding");
    return { success: true };
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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

    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error: any) {
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

    // Validate SMS phone requirement
    if (data.smsAlerts && !data.phone) {
      return {
        success: false,
        error: "Please provide a phone number for SMS alerts.",
      };
    }

    // Create notification preferences
    const { error: preferencesError } = await supabase
      .from("notification_preferences")
      .insert({
        user_id: user.id,
        business_id: businessId,
        email_enabled: data.emailAlerts,
        sms_enabled: data.smsAlerts,
        sms_phone_number: data.phone || null,
        email_frequency: "immediately", // Default to immediate
        digest_enabled: false,
        quiet_hours_start: "22:00:00", // Default quiet hours
        quiet_hours_end: "08:00:00",
        min_urgency_for_sms: 1,
        min_rating_threshold: 1,
      });

    if (preferencesError) {
      console.error("Error creating notification preferences:", preferencesError);
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
  } catch (error: any) {
    console.error("Unexpected error in createNotificationPreferences:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
