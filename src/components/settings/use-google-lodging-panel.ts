"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";
import { apiData, apiErrorMessage } from "@/lib/api/api-envelope";

type LodgingPayload = { available?: boolean; lodging?: GoogleLodgingJson | null; healthScore?: number };

export function useGoogleLodgingPanel(businessId: string) {
    const [loading, setLoading] = useState(true);
    const [lodging, setLodging] = useState<GoogleLodgingJson | null>(null);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [healthScore, setHealthScore] = useState(0);
    const [saving, setSaving] = useState(false);
    const [googleDiff, setGoogleDiff] = useState<{ lodging: unknown; diffMask: string | null } | null>(null);
    const [diffOpen, setDiffOpen] = useState(false);
    const [tabsVersion, setTabsVersion] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/google/lodging?businessId=${encodeURIComponent(businessId)}`);
            const body: unknown = await res.json();
            if (!res.ok) throw new Error(apiErrorMessage(body, "Failed to load"));
            const data = apiData<LodgingPayload>(body) ?? {};
            if (!data.available) {
                setAvailable(false);
                setLodging(null);
                setHealthScore(0);
                return;
            }
            setAvailable(true);
            setLodging(data.lodging ?? null);
            setHealthScore(data.healthScore ?? 0);
            setTabsVersion((x) => x + 1);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to load lodging");
            setAvailable(null);
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        void load();
    }, [load]);

    const patch = async (patches: LodgingPatches) => {
        setSaving(true);
        try {
            const res = await fetch("/api/google/lodging", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, patches }),
            });
            const body: unknown = await res.json();
            if (!res.ok) throw new Error(apiErrorMessage(body, "Save failed"));
            const data = apiData<LodgingPayload>(body);
            if (!data?.lodging) throw new Error("Google did not return the updated lodging details");
            toast.success("Lodging updated on Google");
            setLodging(data.lodging);
            if (typeof data.healthScore === "number") setHealthScore(data.healthScore);
            setTabsVersion((x) => x + 1);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const loadGoogleUpdated = async () => {
        try {
            const res = await fetch(`/api/google/lodging/google-updated?businessId=${encodeURIComponent(businessId)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Request failed");
            setGoogleDiff({ lodging: data.lodging, diffMask: data.diffMask });
            setDiffOpen(true);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Could not load Google updates");
        }
    };

    return {
        loading,
        lodging,
        available,
        healthScore,
        saving,
        googleDiff,
        diffOpen,
        setDiffOpen,
        tabsVersion,
        load,
        patch,
        loadGoogleUpdated,
    };
}
