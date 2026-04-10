import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { deleteReviewReply, replyToReview, listAccounts } from "@/services/google/business-profile";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";

const replySchema = z.object({
    text: z.string().min(1, "Reply text is required").max(4096),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    try {
        const parsed = replySchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0].message, { status: 400 });
        }
        const { text } = parsed.data;

        // 2. Fetch Review & Verify Ownership
        const { data: review, error: reviewError } = await supabase
            .from("reviews")
            .select(`
                *,
                businesses!inner(
                    organizations!inner(
                        organization_members!inner(user_id)
                    )
                )
            `)
            .eq("id", id)
            .eq("businesses.organizations.organization_members.user_id", user.id)
            .single();

        if (reviewError || !review) {
            console.error("Review Fetch Error or Not Found:", reviewError);
            return apiError("Review not found or unauthorized", { status: 404 });
        }

        // 3. Validate Platform
        if (review.platform !== 'google') {
            return apiError("Only Google reviews supported currently", { status: 400 });
        }

        if (!review.platform_id) {
            return apiError("Review is missing platform connection", { status: 500 });
        }

        // 4. Get Valid Token (handles refresh)
        const { accessToken, platform } = await getValidGoogleToken(review.platform_id);

        // 5. Resolve Location & Account IDs
        const locationId = platform.external_id;
        if (!locationId) throw new Error("Platform location ID missing");

        // We need Account ID. Since we don't store it, fetch lists.
        // TODO: Store account_id in review_platforms to optimize this.
        const accounts = await listAccounts(accessToken!);
        // Prioritize ORGANIZATION type if multiple, else first.
        const account = accounts.find((a) => a.type === "ORGANIZATION") || accounts[0];

        if (!account) throw new Error("No Google Business Account found");

        const accountId = account.name.split("/")[1];

        // 6. Post Reply to Google
        if (!review.external_id) throw new Error("Review external ID missing");
        await replyToReview(accessToken!, accountId, locationId, review.external_id, text);

        // 7. Update Database
        const admin = createAdminClient();
        const { error: updateError } = await admin
            .from("reviews")
            .update({
                response_status: "responded",
                response_text: text,
                responded_at: new Date().toISOString(),
                response_source: "zyene",
            })
            .eq("id", review.id);

        if (updateError) throw updateError;

        return apiOk({ replied: true });

    } catch (error: any) {
        console.error("Reply API Error:", error);
        
        const message = error?.message || "Internal Server Error";
        
        // Handle specific connection/auth errors gracefully
        if (message.includes("Google connection expired") || message.includes("reconnect") || message.includes("invalid_grant")) {
            return apiError("Google connection expired. Please reconnect your account.", { status: 401 });
        }
        
        if (message.includes("rate limit") || message.includes("Quota")) {
            return apiError("Google API quota exceeded. Please wait a few minutes.", { status: 429 });
        }

        return apiError(message, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    try {
        const { data: review, error: reviewError } = await supabase
            .from("reviews")
            .select(`
                *,
                businesses!inner(
                    organizations!inner(
                        organization_members!inner(user_id)
                    )
                )
            `)
            .eq("id", id)
            .eq("businesses.organizations.organization_members.user_id", user.id)
            .single();

        if (reviewError || !review) {
            console.error("Review Fetch Error or Not Found:", reviewError);
            return apiError("Review not found or unauthorized", { status: 404 });
        }

        if (review.platform !== "google") {
            return apiError("Only Google reviews supported currently", { status: 400 });
        }

        if (!review.platform_id) {
            return apiError("Review is missing platform connection", { status: 500 });
        }

        const { accessToken, platform } = await getValidGoogleToken(review.platform_id);

        const locationId = platform.external_id;
        if (!locationId) throw new Error("Platform location ID missing");

        const accounts = await listAccounts(accessToken!);
        const account = accounts.find((a) => a.type === "ORGANIZATION") || accounts[0];
        if (!account) throw new Error("No Google Business Account found");

        const accountId = account.name.split("/")[1];

        if (!review.external_id) throw new Error("Review external ID missing");
        await deleteReviewReply(accessToken!, accountId, locationId, review.external_id);

        const admin = createAdminClient();
        const { error: updateError } = await admin
            .from("reviews")
            .update({
                response_status: "pending",
                response_text: null,
                responded_at: null,
                response_source: null,
            })
            .eq("id", review.id);

        if (updateError) throw updateError;

        return apiOk({ deleted: true });
    } catch (error: unknown) {
        console.error("Delete reply API Error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";

        if (message.includes("Google connection expired") || message.includes("reconnect") || message.includes("invalid_grant")) {
            return apiError("Google connection expired. Please reconnect your account.", { status: 401 });
        }

        if (message.includes("rate limit") || message.includes("Quota")) {
            return apiError("Google API quota exceeded. Please wait a few minutes.", { status: 429 });
        }

        return apiError(message, { status: 500 });
    }
}
