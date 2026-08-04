import { headers } from "next/headers";

import { logger } from "@/lib/logger";
import type { OnboardingGoogleLocationInfo } from "@/types/components";

import { mapGoogleCategory } from "./google-category-map";
import type { GoogleBusinessLocation, GoogleStorefrontAddress } from "./types";

export type GoogleLocationInput = GoogleBusinessLocation | OnboardingGoogleLocationInfo;

const LOCATION_READ_MASK =
    "title,storefrontAddress,phoneNumbers,categories,websiteUri,profile,metadata";

export function resolveStorefrontAddress(
    loc: GoogleLocationInput,
): GoogleStorefrontAddress | null {
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

/**
 * Only ever returns an /onboarding URL, and only on the host that made the
 * request — otherwise falls back to the configured app URL. This keeps a
 * client-supplied redirect_uri from pointing the OAuth exchange elsewhere.
 */
export async function resolveGoogleOAuthRedirectUri(
    clientRedirectUri?: string,
): Promise<string> {
    const envBase = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
        /\/$/,
        "",
    );
    const fallback = `${envBase}/onboarding`;

    const headerList = await headers();
    const rawHost = headerList.get("x-forwarded-host") || headerList.get("host");
    const requestHost = rawHost?.split(",")[0]?.trim() ?? "";

    const trimmed = clientRedirectUri?.trim();
    if (!trimmed) return fallback;

    try {
        const u = new URL(trimmed);
        const path = u.pathname.replace(/\/$/, "") || "/";
        if (path !== "/onboarding") return fallback;
        if (requestHost && u.host === requestHost) return `${u.origin}/onboarding`;
    } catch {
        /* use fallback */
    }

    return fallback;
}

export interface GoogleTokenBundle {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}

/** Exchanges an OAuth authorization code for tokens. Returns null on failure. */
export async function exchangeGoogleAuthCode(
    authCode: string,
    redirectUri: string,
): Promise<GoogleTokenBundle | null> {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code: authCode,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenResponse.ok) {
        logger.error({ body: await tokenResponse.text() }, "Failed to exchange auth code");
        return null;
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) return null;

    return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token as string | undefined,
        expiresIn: tokenData.expires_in,
    };
}

/** Lists every Business Profile location across all accounts the token can see. */
export async function listGoogleBusinessLocations(
    accessToken: string,
): Promise<GoogleBusinessLocation[]> {
    const accountsResponse = await fetch(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!accountsResponse.ok) return [];

    const accountsData = await accountsResponse.json();
    const accounts = (accountsData.accounts || []) as Array<{ name: string }>;
    if (accounts.length === 0) return [];

    const locationGroups = await Promise.all(
        accounts.map(async (account) => {
            const locationsResponse = await fetch(
                `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=${encodeURIComponent(LOCATION_READ_MASK)}`,
                { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            if (!locationsResponse.ok) return [] as GoogleBusinessLocation[];
            const locationsData = await locationsResponse.json();
            return (locationsData.locations || []) as GoogleBusinessLocation[];
        }),
    );

    return locationGroups.flat();
}

/** Flattens Google locations into the shape the location picker expects. */
export function mapLocationsForSelection(locations: GoogleBusinessLocation[]) {
    return locations.map((loc) => {
        const addr = loc.storefrontAddress;
        const line = addr?.addressLines?.[0] || "";
        const locality = addr?.locality || "";
        const area = addr?.administrativeArea || "";

        return {
            name: loc.name,
            businessName: loc.title,
            address: line,
            city: locality,
            state: area,
            phone: loc.phoneNumbers?.primaryPhone || "",
            category: mapGoogleCategory(loc.categories?.primaryCategory?.displayName),
            fullAddress: `${line}, ${locality}, ${area}`
                .replace(/^, /, "")
                .replace(/, , /g, ", "),
        };
    });
}
