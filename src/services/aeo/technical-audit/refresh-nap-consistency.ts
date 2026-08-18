import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation } from "@/services/google/listing-information";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { compareNapObservation, type Nap } from "./nap-consistency";

type Admin = SupabaseClient<Database>;
function address(parts: (string | null | undefined)[]) { return parts.filter(Boolean).join(", "); }
function plain(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim(); }

export async function refreshNapConsistency(db: Admin, businessId: string) {
    const [businessResult, platformsResult] = await Promise.all([
        db.from("businesses").select("name, phone, address_line1, city, state, zip, country").eq("id", businessId).single(),
        db.from("review_platforms").select("id, platform, external_url, google_location_id")
            .eq("business_id", businessId).in("platform", ["google", "yelp", "facebook"]),
    ]);
    if (businessResult.error || platformsResult.error) throw new Error("Unable to load NAP inputs");
    const business = businessResult.data;
    const canonical: Nap = { name: business.name, phone: business.phone ?? "",
        address: address([business.address_line1, business.city, business.state, business.zip, business.country]) };
    let persisted = 0;
    for (const platform of platformsResult.data ?? []) {
        let observed: Nap | null = null;
        if (platform.platform === "google" && platform.google_location_id) {
            try {
                const { accessToken } = await getValidGoogleToken(platform.id);
                if (accessToken) {
                    const location = await getGoogleLocation(accessToken, platform.google_location_id);
                    observed = { name: location.title ?? "", phone: location.phoneNumbers?.primaryPhone ?? "",
                        address: address([...(location.storefrontAddress?.addressLines ?? []),
                            location.storefrontAddress?.locality, location.storefrontAddress?.administrativeArea,
                            location.storefrontAddress?.postalCode]) };
                }
            } catch { /* Connected-but-unavailable remains unknown, never a mismatch. */ }
        } else if (platform.external_url) {
            const safety = await checkOriginIsPublic(platform.external_url);
            if (safety.safe) try {
                const response = await fetch(platform.external_url, { redirect: "error", signal: AbortSignal.timeout(10_000),
                    headers: { "User-Agent": "Zyene-AEO-Audit/1.0" } });
                if (!response.ok) throw new Error(`Directory returned HTTP ${response.status}`);
                const body = plain((await response.text()).slice(0, 1_000_000));
                observed = { name: body.includes(plain(canonical.name)) ? canonical.name : "",
                    address: body.includes(plain(canonical.address)) ? canonical.address : "",
                    phone: body.includes(canonical.phone.replace(/\D/g, "")) ? canonical.phone : "" };
            } catch { /* Persist unknown below. */ }
        }
        const comparison = observed ? compareNapObservation(canonical, observed) : null;
        const write = await db.from("aeo_nap_observations" as never).upsert({
            business_id: businessId, source_name: platform.platform, source_url: platform.external_url,
            observed_name: observed?.name || null, observed_address: observed?.address || null,
            observed_phone: observed?.phone || null, name_matches: comparison?.nameMatches ?? null,
            address_matches: comparison?.addressMatches ?? null, phone_matches: comparison?.phoneMatches ?? null,
            provenance: "connected_platform", checked_at: new Date().toISOString(),
        } as never, { onConflict: "business_id,source_name" });
        if (write.error) throw new Error(`NAP upsert failed: ${write.error.message}`);
        persisted += 1;
    }
    return { persisted };
}
