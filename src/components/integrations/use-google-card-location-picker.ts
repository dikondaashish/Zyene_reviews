"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    fetchGoogleLocationAccounts,
    postGoogleSelectedLocation,
    type GoogleLocationAccount,
} from "@/components/integrations/google-card-location-api";

export function useGoogleCardLocationPicker(businessId: string) {
    const router = useRouter();
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    const [accounts, setAccounts] = useState<GoogleLocationAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");

    const loadLocations = async (onUnauthorized: () => void) => {
        setIsLoadingLocations(true);
        try {
            const accs = await fetchGoogleLocationAccounts(businessId, onUnauthorized);
            setAccounts(accs);
            if (accs.length > 0) {
                setSelectedAccount(accs[0].resourceName);
                const firstLoc = accs[0].locations?.[0]?.name;
                if (firstLoc) setSelectedLocation(firstLoc);
            }
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const saveLocation = async (setIsPickingLocation: (v: boolean) => void) => {
        if (!selectedAccount || !selectedLocation) return;
        try {
            const ok = await postGoogleSelectedLocation(businessId, selectedAccount, selectedLocation);
            if (ok) {
                setIsPickingLocation(false);
                router.refresh();
            }
        } catch (e: unknown) {
            toast.error("Failed to save location", { description: e instanceof Error ? e.message : undefined });
        }
    };

    return {
        isLoadingLocations,
        accounts,
        selectedAccount,
        setSelectedAccount,
        selectedLocation,
        setSelectedLocation,
        loadLocations,
        saveLocation,
    };
}
