"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { step1FormSchema, step3FormSchema, step4FormSchema, type Step1FormData, type Step3FormData, type Step4FormData } from "@/lib/validations/onboarding";

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

    // Fetch Google Business Profile data
    let reviewData = { reviewCount: 0, averageRating: 0 };

    try {
      // Get list of locations for the account
      const accountsResponse = await fetch(
        "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        const accounts = accountsData.accounts || [];

        if (accounts.length > 0) {
          const accountId = accounts[0].name; // Format: "accounts/{accountId}"

          // Get locations for the first account
          const locationsResponse = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            const locations = locationsData.locations || [];

            if (locations.length > 0) {
              const location = locations[0];
              reviewData = {
                reviewCount: location.reviewCount || 0,
                averageRating: location.averageRating || 0,
              };
            }
          }
        }
      }
    } catch (apiError) {
      console.error("Error fetching Google Business Profile data:", apiError);
      // Continue even if we can't fetch the data
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
        is_connected: true,
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
