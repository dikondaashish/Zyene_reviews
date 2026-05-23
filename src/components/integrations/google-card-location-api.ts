import { toast } from "sonner";
import type { ApiErrorResponse, GoogleLocationSelectorResponse } from "@/types/components";

export type GoogleLocationAccount = {
    resourceName: string;
    accountName: string;
    locations: Array<{ name: string; title: string; storeCode?: string | null }>;
};

export async function fetchGoogleLocationAccounts(
    businessId: string,
    onUnauthorizedReconnect: () => void
): Promise<GoogleLocationAccount[]> {
    const res = await fetch(`/api/google/location-selector?businessId=${encodeURIComponent(businessId)}`);
    const data = (await res.json().catch(() => ({}))) as GoogleLocationSelectorResponse;
    if (!res.ok) {
        const msg = data.error || "Failed to load Google locations";
        toast.error("Failed to load Google locations", { description: msg });
        if (res.status === 401 && /reconnect/i.test(String(msg))) {
            onUnauthorizedReconnect();
        }
        return [];
    }
    const accs = data.data?.accounts || data.accounts || [];
    return accs;
}

export async function postGoogleSelectedLocation(
    businessId: string,
    accountName: string,
    locationName: string
): Promise<boolean> {
    const res = await fetch("/api/google/location-selector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            businessId,
            accountName,
            locationName,
        }),
    });
    const data = (await res.json().catch(() => ({}))) as ApiErrorResponse;
    if (!res.ok) {
        toast.error("Failed to save location", { description: data.error });
        return false;
    }
    toast.success("Google location linked");
    return true;
}
