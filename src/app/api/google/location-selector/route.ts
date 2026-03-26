import { createClient } from "@/lib/supabase/server";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";
import { getValidGoogleToken } from "@/lib/google/sync-service";
import { listAccounts, listLocations } from "@/lib/google/business-profile";
import { registerNotifications } from "@/lib/google/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { redis } from "@/lib/redis";
import { type NextRequest, NextResponse } from "next/server";

function buildGoogleReviewUrl(location: { metadata?: { placeId?: string; newReviewUri?: string; mapsUri?: string } }) {
    if (location.metadata?.placeId) {
        return `https://search.google.com/local/writereview?placeid=${location.metadata.placeId}`;
    }
    return location.metadata?.newReviewUri || location.metadata?.mapsUri || null;
}

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businessId = request.nextUrl.searchParams.get("businessId");
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: platform, error: platErr } = await supabase
        .from("review_platforms")
        .select("id, platform, google_account_id, google_location_id, sync_status")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();

    if (platErr || !platform) {
        return NextResponse.json({ error: "Google not connected" }, { status: 404 });
    }

    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) return NextResponse.json({ error: "Token unavailable" }, { status: 401 });

        const accounts = await listAccounts(accessToken);
        const accountSummaries: Array<{
            resourceName: string;
            accountName: string;
            locations: Array<{ name: string; title: string; storeCode?: string | null }>;
        }> = [];

        for (const acc of accounts.slice(0, 8)) {
            const resourceName = acc.name; // accounts/{id}
            let locations: Array<{ name: string; title: string; storeCode?: string | null }> = [];
            try {
                const locs = await listLocations(accessToken, resourceName);
                locations = locs.map((l) => ({
                    name: l.name,
                    title: l.title || l.name,
                    storeCode: l.storeCode ?? null,
                }));
            } catch {
                locations = [];
            }
            accountSummaries.push({
                resourceName,
                accountName: acc.accountName || resourceName.replace(/^accounts\//, ""),
                locations: locations.slice(0, 50),
            });
        }

        return NextResponse.json({
            accounts: accountSummaries,
            current: {
                googleAccountId: platform.google_account_id as string | null,
                googleLocationId: platform.google_location_id as string | null,
                syncStatus: platform.sync_status as string | null,
            },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as {
        businessId?: string;
        accountName?: string; // accounts/{id}
        locationName?: string; // locations/{id} or accounts/{id}/locations/{id}
    };
    if (!body.businessId || !body.accountName || !body.locationName) {
        return NextResponse.json({ error: "businessId, accountName, and locationName required" }, { status: 400 });
    }

    const allowed = await userCanAccessBusiness(supabase, user.id, body.businessId);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: platform, error: platErr } = await supabase
        .from("review_platforms")
        .select("id, business_id, platform")
        .eq("business_id", body.businessId)
        .eq("platform", "google")
        .maybeSingle();

    if (platErr || !platform) {
        return NextResponse.json({ error: "Google not connected" }, { status: 404 });
    }

    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) return NextResponse.json({ error: "Token unavailable" }, { status: 401 });

        const accountName = body.accountName;
        const rawAccountId = accountName.replace(/^accounts\//, "");

        const locs = await listLocations(accessToken, accountName);
        const match = locs.find((l) => l.name === body.locationName || l.name.endsWith(`/${body.locationName}`));
        if (!match) {
            return NextResponse.json({ error: "Location not found for this account" }, { status: 404 });
        }

        const rawLocationId = match.name.split("/").pop() || null;
        const externalUrl = buildGoogleReviewUrl(match as any);

        const admin = createAdminClient();

        // If switching locations, clear old imported Google reviews for this business.
        await admin.from("reviews").delete().eq("business_id", platform.business_id).eq("platform", "google");

        await admin
            .from("review_platforms")
            .update({
                google_account_id: rawAccountId,
                google_location_id: rawLocationId,
                external_id: rawLocationId,
                external_url: externalUrl,
                // reset rollups; next sync will repopulate
                total_reviews: 0,
                average_rating: 0,
                last_synced_at: null,
                sync_status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", platform.id);

        // Keep businesses rollups consistent (after deleting imported reviews).
        await admin
            .from("businesses")
            .update({ total_reviews: 0, average_rating: 0, updated_at: new Date().toISOString() })
            .eq("id", platform.business_id);

        // Register Pub/Sub notifications now that we know the account.
        const topicName = process.env.GOOGLE_PUBSUB_TOPIC_NAME;
        if (topicName) {
            try {
                await registerNotifications(accessToken, accountName, topicName);
            } catch (e) {
                console.error("[Google Notifications] Registration failed (non-fatal):", e);
            }
        }

        // Bust cached business context so UI updates immediately.
        try {
            await redis.del(`user_businesses:${user.id}`);
        } catch (e) {
            console.error("[Location Selector] Failed to clear business cache:", e);
        }

        return NextResponse.json({
            success: true,
            googleAccountId: rawAccountId,
            googleLocationId: rawLocationId,
            externalUrl,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

