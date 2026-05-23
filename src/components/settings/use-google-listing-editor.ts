"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { GoogleListingForm, GoogleListingMeta, GoogleProfileHealthCheck } from "./google-listing-editor-types";
import {
    parseGoogleListingLoadPayload,
    parseGoogleListingSavePayload,
} from "./google-listing-editor-utils";

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

            const { form: next, meta: nextMeta, profileHealth: nextHealth } =
                parseGoogleListingLoadPayload(payload);
            setForm(next);
            initialRef.current = { ...next };
            setProfileHealth(nextHealth);
            setMeta(nextMeta);
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

            const data = parseGoogleListingSavePayload(payload);
            toast.success("Google listing updated");
            if (data.form) {
                setForm(data.form);
                initialRef.current = { ...data.form };
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
