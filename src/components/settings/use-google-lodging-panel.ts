"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { LodgingPatches } from "@/services/google/lodging-merge";
import type { GoogleLodgingJson } from "@/components/settings/google-lodging-types";

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
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load");
            if (!data.available) {
                setAvailable(false);
                setLodging(null);
                setHealthScore(0);
                return;
            }
            setAvailable(true);
            setLodging(data.lodging);
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
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            toast.success("Lodging updated on Google");
            setLodging((data.lodging as GoogleLodgingJson) || null);
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
