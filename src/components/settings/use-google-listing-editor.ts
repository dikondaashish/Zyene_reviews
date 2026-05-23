"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type {
    GoogleListingForm,
    GoogleListingMeta,
    GoogleProfileHealthCheck,
} from "./google-listing-editor-types";
import { unwrapGoogleListingApiData } from "./google-listing-editor-utils";

export function useGoogleListingEditor(businessId: string) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<GoogleListingForm>({
        title: "",
        websiteUri: "",
        primaryPhone: "",
        description: "",
    });
    const initialRef = useRef<GoogleListingForm | null>(null);
    const [profileHealth, setProfileHealth] = useState<{
        score: number;
        checks: GoogleProfileHealthCheck[];
    } | null>(null);
    const [notConnected, setNotConnected] = useState(false);
    const [meta, setMeta] = useState<GoogleListingMeta | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setNotConnected(false);
        try {
            const res = await fetch(`/api/google/listing?businessId=${encodeURIComponent(businessId)}`);
            const payload = await res.json();

            if (!res.ok) {
                if (res.status === 404 || payload.code === "GOOGLE_NOT_CONNECTED") {
                    setNotConnected(true);
                    return;
                }
                throw new Error(payload.error || "Failed to load listing");
            }

            const data = unwrapGoogleListingApiData<{
                listing?: {
                    title?: string;
                    websiteUri?: string;
                    primaryPhone?: string;
                    description?: string;
                    primaryCategoryDisplay?: string;
                    mapsUri?: string;
                    hasRegularHours?: boolean;
                };
                profileHealth?: { score: number; checks: GoogleProfileHealthCheck[] };
            }>(payload);
            const L = data?.listing;
            if (!L) {
                throw new Error("Google listing payload missing listing details");
            }
            const next: GoogleListingForm = {
                title: L.title || "",
                websiteUri: L.websiteUri || "",
                primaryPhone: L.primaryPhone || "",
                description: L.description || "",
            };
            setForm(next);
            initialRef.current = { ...next };
            setProfileHealth(data.profileHealth ?? null);
            setMeta({
                primaryCategoryDisplay: L.primaryCategoryDisplay || "",
                mapsUri: L.mapsUri || "",
                hasRegularHours: !!L.hasRegularHours,
            });
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to load Google listing");
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialRef.current) return;

        const body: Record<string, string> = { businessId };
        const init = initialRef.current;
        if (form.title !== init.title) body.title = form.title;
        if (form.websiteUri !== init.websiteUri) body.websiteUri = form.websiteUri;
        if (form.primaryPhone !== init.primaryPhone) body.primaryPhone = form.primaryPhone;
        if (form.description !== init.description) body.description = form.description;

        if (Object.keys(body).length === 1) {
            toast.message("No changes to save.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/google/listing", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload.error || "Update failed");
            const data = unwrapGoogleListingApiData<{
                listing?: {
                    title?: string;
                    websiteUri?: string;
                    primaryPhone?: string;
                    description?: string;
                };
                profileHealth?: { score: number; checks: GoogleProfileHealthCheck[] };
            }>(payload);

            toast.success("Google listing updated");
            if (data.listing) {
                const L = data.listing;
                const next: GoogleListingForm = {
                    title: L.title || "",
                    websiteUri: L.websiteUri || "",
                    primaryPhone: L.primaryPhone || "",
                    description: L.description || "",
                };
                setForm(next);
                initialRef.current = { ...next };
            }
            if (data.profileHealth) {
                setProfileHealth(data.profileHealth);
            }
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Update failed");
        } finally {
            setSaving(false);
        }
    };

    return {
        loading,
        saving,
        form,
        setForm,
        profileHealth,
        notConnected,
        meta,
        load,
        handleSubmit,
    };
}
